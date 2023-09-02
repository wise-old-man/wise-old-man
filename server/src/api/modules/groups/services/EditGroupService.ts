import { z } from 'zod';
import prisma, { Membership, PrismaTypes, Player } from '../../../../prisma';
import { GroupRole, NameChangeStatus, PRIVELEGED_GROUP_ROLES } from '../../../../utils';
import logger from '../../../util/logging';
import { omit } from '../../../util/objects';
import { BadRequestError, ServerError } from '../../../errors';
import {
  ActivityType,
  GroupDetails,
  MemberJoinedEvent,
  MemberLeftEvent,
  MemberRoleChangeEvent
} from '../group.types';
import { isValidUsername, sanitize, standardize } from '../../players/player.utils';
import * as playerServices from '../../players/player.services';
import { sanitizeName } from '../group.utils';
import { onMembersRolesChanged, onMembersJoined, onMembersLeft } from '../group.events';

const MIN_NAME_ERROR = 'Group name must have at least one character.';

const MAX_NAME_ERROR = 'Group name cannot be longer than 30 characters.';

const MAX_DESCRIPTION_ERROR = 'Description cannot be longer than 100 characters.';

const INVALID_MEMBERS_ARRAY_ERROR = "Parameter 'members' is not a valid array.";

const INVALID_MEMBER_OBJECT_ERROR =
  'Invalid members list. Must be an array of { username: string; role?: string; }.';

const INVALID_CLAN_CHAT_ERROR =
  "Invalid 'clanChat'. Must be 1-12 character long, contain no special characters and/or contain no space at the beginning or end of the name.";

const MEMBER_INPUT_SCHEMA = z.object(
  {
    username: z.string(),
    role: z.nativeEnum(GroupRole).optional().default(GroupRole.MEMBER)
  },
  { invalid_type_error: INVALID_MEMBER_OBJECT_ERROR }
);

const inputSchema = z
  .object({
    id: z.number().int().positive(),
    name: z.string().min(1, MIN_NAME_ERROR).max(30, MAX_NAME_ERROR).optional(),
    clanChat: z.string().optional(),
    homeworld: z.number().int().positive().optional(),
    description: z.string().max(100, MAX_DESCRIPTION_ERROR).optional(),
    members: z.array(MEMBER_INPUT_SCHEMA, { invalid_type_error: INVALID_MEMBERS_ARRAY_ERROR }).optional()
  })
  .refine(s => !s.clanChat || isValidUsername(s.clanChat), {
    message: INVALID_CLAN_CHAT_ERROR
  });

type EditGroupParams = z.infer<typeof inputSchema>;

async function editGroup(payload: EditGroupParams): Promise<GroupDetails> {
  const params = inputSchema.parse(payload);
  const updatedGroupFields: PrismaTypes.GroupUpdateInput = {};

  if (!params.name && !params.clanChat && !params.homeworld && !params.description && !params.members) {
    throw new BadRequestError('Nothing to update.');
  }

  if (params.members) {
    const invalidUsernames = params.members.map(m => m.username).filter(u => !isValidUsername(u));

    if (invalidUsernames.length > 0) {
      throw new BadRequestError(
        `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
         contain no special characters, and/or contain no space at the beginning or end of the name.`,
        invalidUsernames
      );
    }
  }

  if (params.name) {
    const name = sanitizeName(params.name);

    // Check for duplicate names
    const duplicateGroup = await prisma.group.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } }
    });

    if (duplicateGroup && duplicateGroup.id !== params.id) {
      throw new BadRequestError(`Group name '${name}' is already taken. (ID: ${duplicateGroup.id})`);
    }

    updatedGroupFields.name = name;
  }

  if (params.description) {
    updatedGroupFields.description = params.description ? sanitizeName(params.description) : null;
  }

  if (params.clanChat) {
    updatedGroupFields.clanChat = params.clanChat ? sanitize(params.clanChat) : null;
  }

  if (params.homeworld) {
    updatedGroupFields.homeworld = params.homeworld;
  }

  await executeUpdate(params, updatedGroupFields);

  const updatedGroup = await prisma.group.findFirst({
    where: { id: params.id },
    include: {
      memberships: {
        include: { player: true }
      }
    }
  });

  if (!updatedGroup) {
    throw new ServerError('Failed to edit group. (EditGroupService)');
  }

  logger.moderation(`[Group:${params.id}] Edited`);

  const priorities = PRIVELEGED_GROUP_ROLES.reverse();

  const sortedMemberships = updatedGroup.memberships.sort(
    (a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role)
  );

  return {
    ...omit(updatedGroup, 'verificationHash'),
    memberCount: sortedMemberships.length,
    memberships: sortedMemberships
  };
}

async function executeUpdate(params: EditGroupParams, updatedGroupFields: PrismaTypes.GroupUpdateInput) {
  if (!params.members) {
    await prisma.group.update({
      where: {
        id: params.id
      },
      data: {
        ...updatedGroupFields,
        updatedAt: new Date() // Force update the "updatedAt" field
      }
    });

    return;
  }

  const memberships = await prisma.membership.findMany({
    where: { groupId: params.id },
    include: { player: true }
  });

  // The usernames of all current (pre-edit) members
  const currentUsernames = memberships.map(m => m.player.username);

  // The usernames of all future (post-edit) members
  const nextUsernames = params.members.map(m => standardize(m.username));

  // These players should be added to the group
  const missingUsernames = nextUsernames.filter(u => !currentUsernames.includes(u));

  // These players should remain in the group
  const keptUsernames = nextUsernames.filter(u => currentUsernames.includes(u));

  // Find or create all players with the given usernames
  const nextPlayers = await playerServices.findPlayers({
    usernames: nextUsernames,
    createIfNotFound: true
  });

  const keptPlayers = nextPlayers.filter(p => keptUsernames.includes(p.username));
  const missingPlayers = nextPlayers.filter(p => missingUsernames.includes(p.username));

  const leftEvents: MemberLeftEvent[] = [];
  const joinedEvents: MemberJoinedEvent[] = [];
  const changedRoleEvents: MemberRoleChangeEvent[] = [];

  // If any new group members are included in a name change request that is still pending
  // it will be included here to be checked if the old name of the name change
  // matches any players that left the group. If they match it means that it's
  // likely it's not two different players who joined and left but the same
  // player that just name changed.
  const pendingNameChanges = await prisma.nameChange.findMany({
    where: {
      OR: missingPlayers.map(p => {
        return { newName: { equals: p.username, mode: 'insensitive' } };
      }),
      status: NameChangeStatus.PENDING
    },
    orderBy: { createdAt: 'desc' }
  });

  await prisma
    .$transaction(async transaction => {
      const excessMemberships = await removeExcessMemberships(
        transaction as unknown as PrismaTypes.TransactionClient,
        params.id,
        memberships,
        nextUsernames
      );

      const ignoreFromJoined: number[] = [];
      const ignoreFromLeft: number[] = [];

      for (const nameChange of pendingNameChanges) {
        const { oldName, newName } = nameChange;

        for (const player of missingPlayers) {
          // This matches a player who left the group with the old name of a name change.
          // And if it's not undefined it means we found a name change that includes
          // both a player who joined the group and a player who left the group.
          const match = excessMemberships.find(m => m.player.username === standardize(oldName));

          if (player.username === standardize(newName) && match !== undefined) {
            ignoreFromJoined.push(player.id);
            ignoreFromLeft.push(match.playerId);
          }
        }
      }

      // Register "player left" events
      leftEvents.push(
        ...excessMemberships
          .filter(m => !ignoreFromLeft.includes(m.playerId))
          .map(m => ({ playerId: m.playerId, groupId: m.groupId, type: ActivityType.LEFT }))
      );

      // Add any missing memberships
      const addedPlayerIds = await addMissingMemberships(
        transaction as unknown as PrismaTypes.TransactionClient,
        params.id,
        missingPlayers,
        params.members
      );

      // Register "player joined" events
      joinedEvents.push(
        ...addedPlayerIds
          .filter(id => !ignoreFromJoined.includes(id.playerId))
          .map(pId => ({ ...pId, type: ActivityType.JOINED }))
      );

      const roleUpdatesMap = calculateRoleChangeMaps(keptPlayers, memberships, params.members);

      const currentRoleMap = new Map<number, GroupRole>(
        Array.from(memberships).map(m => [m.playerId, m.role])
      );

      for (const role of roleUpdatesMap.keys()) {
        // Update all memberships with the new role
        await transaction.membership.updateMany({
          where: {
            groupId: params.id,
            playerId: { in: roleUpdatesMap.get(role) }
          },
          data: {
            role
          }
        });

        // Register "player role changed" events
        changedRoleEvents.push(
          ...roleUpdatesMap.get(role).map(id => ({
            playerId: id,
            groupId: params.id,
            role,
            type: ActivityType.CHANGED_ROLE,
            previousRole: currentRoleMap.get(id),
            displayName: keptPlayers.find(p => p.id === id).displayName
          }))
        );
      }

      await transaction.memberActivity.createMany({
        data: [
          ...leftEvents,
          ...joinedEvents.map(a => ({ ...a, role: null })),
          ...changedRoleEvents.map(p => omit(p, 'previousRole', 'displayName'))
        ]
      });

      await transaction.group.update({
        where: {
          id: params.id
        },
        data: {
          ...updatedGroupFields,
          updatedAt: new Date() // Force update the "updatedAt" field
        }
      });
    })
    .catch(error => {
      logger.error('Failed to edit group', error);
      throw new ServerError('Failed to edit group');
    });

  // If no error was thrown by this point, dispatch all events
  if (leftEvents.length > 0) onMembersLeft(leftEvents);
  if (joinedEvents.length > 0) onMembersJoined(joinedEvents);
  if (changedRoleEvents.length > 0) onMembersRolesChanged(changedRoleEvents);
}

async function removeExcessMemberships(
  transaction: PrismaTypes.TransactionClient,
  groupId: number,
  currentMemberships: (Membership & { player: Player })[],
  nextUsernames: string[]
) {
  const excessMemberships = currentMemberships.filter(m => !nextUsernames.includes(m.player.username));

  await transaction.membership.deleteMany({
    where: {
      groupId,
      playerId: { in: excessMemberships.map(m => m.playerId) }
    }
  });

  return excessMemberships;
}

async function addMissingMemberships(
  transaction: PrismaTypes.TransactionClient,
  groupId: number,
  missingPlayers: Player[],
  memberInputs: EditGroupParams['members']
) {
  const roleMap: { [playerId: number]: GroupRole } = {};

  missingPlayers.forEach(player => {
    const role = memberInputs.find(m => standardize(m.username) === player.username)?.role;
    if (!role) return;

    roleMap[player.id] = role;
  });

  if (Object.keys(roleMap).length !== missingPlayers.length) {
    throw new ServerError('Failed to construct roleMap (EditGroupService: addMissingMemberships)');
  }

  const payload = missingPlayers.map(p => ({
    playerId: p.id,
    groupId,
    role: roleMap[p.id]
  }));

  await transaction.membership.createMany({
    data: payload,
    skipDuplicates: true
  });

  return payload;
}

function calculateRoleChangeMaps(
  keptPlayers: Player[],
  currentMemberships: (Membership & { player: Player })[],
  memberInputs: EditGroupParams['members']
) {
  // Note: reversing the array here to find the role that was last declared for a given username
  const reversedInputs = memberInputs.reverse();

  const newRoleMap = new Map<GroupRole, number[]>();
  const currentRoleMap = new Map<GroupRole, number[]>();

  currentMemberships.forEach(m => {
    if (currentRoleMap.get(m.role)) {
      currentRoleMap.set(m.role, [...currentRoleMap.get(m.role), m.playerId]);
    } else {
      currentRoleMap.set(m.role, [m.playerId]);
    }
  });

  keptPlayers.forEach(player => {
    // Find the next role for this player
    const role = reversedInputs.find(m => standardize(m.username) === player.username)?.role;

    if (!role) return null;

    // Find the current membership for this player
    const membership = currentMemberships.find(m => m.playerId === player.id);

    // Check if the role has changed
    if (!membership || membership.role === role) return null;

    // Player role hasn't changed
    if (currentRoleMap.get(role)?.includes(player.id)) return;

    if (newRoleMap.get(role)) {
      newRoleMap.set(role, [...newRoleMap.get(role), player.id]);
    } else {
      newRoleMap.set(role, [player.id]);
    }
  });

  return newRoleMap;
}

export { editGroup };
