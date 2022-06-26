import { z } from 'zod';
import prisma, {
  Group,
  Membership,
  modifyPlayer,
  PrismaPlayer,
  PrismaTypes,
  PrismaPromise,
  Player
} from '../../../../prisma';
import { GroupRole, PRIVELEGED_GROUP_ROLES } from '../../../../utils';
import { BadRequestError, ServerError } from '../../../errors';
import { GroupWithMemberships } from '../group.types';
import { isValidUsername, sanitize, standardize } from '../../players/player.utils';
import * as playerServices from '../../players/player.services';
import { sanitizeName } from '../group.utils';
import { omit } from 'lodash';

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

async function editGroup(payload: EditGroupParams): Promise<GroupWithMemberships> {
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

    if (duplicateGroup) {
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

  const updatedGroup = await executeUpdate(params, updatedGroupFields);

  if (!updatedGroup) {
    throw new ServerError('Failed to edit group. (EditGroupService)');
  }

  const priorities = PRIVELEGED_GROUP_ROLES.reverse();

  const sortedMemberships = updatedGroup.memberships
    .map(m => ({ ...m, player: modifyPlayer(m.player) }))
    .sort((a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role));

  return {
    ...omit(updatedGroup, ['verificationHash']),
    memberCount: sortedMemberships.length,
    memberships: sortedMemberships
  };
}

type UpdateExecutionResult = Group & {
  memberships: (Membership & {
    player: PrismaPlayer;
  })[];
};

async function executeUpdate(
  params: EditGroupParams,
  updatedGroupFields: PrismaTypes.GroupUpdateInput
): Promise<UpdateExecutionResult> {
  // This action updates the group's fields and returns all the new data + memberships,
  // If ran inside a transaction, it should be the last thing to run, to ensure it returns updated data
  const groupUpdatePromise = prisma.group.update({
    where: {
      id: params.id
    },
    data: {
      ...updatedGroupFields,
      updatedAt: new Date() // Force update the "updatedAt" field
    },
    include: {
      memberships: { include: { player: true } }
    }
  });

  if (params.members) {
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

    const results = await prisma.$transaction([
      // Remove any players that are no longer members
      removeExcessMemberships(params.id, memberships, nextUsernames),
      // Add any missing memberships
      addMissingMemberships(params.id, missingPlayers, params.members),
      // Update any role changes
      ...updateExistingRoles(params.id, keptPlayers, memberships, params.members),
      // Update the group
      groupUpdatePromise
    ]);

    return results[results.length - 1];
  }

  return await groupUpdatePromise;
}

function removeExcessMemberships(
  groupId: number,
  currentMemberships: (Membership & { player: PrismaPlayer })[],
  nextUsernames: string[]
): PrismaPromise<PrismaTypes.BatchPayload> {
  const excessMembers = currentMemberships.filter(m => !nextUsernames.includes(m.player.username));

  return prisma.membership.deleteMany({
    where: {
      groupId,
      playerId: { in: excessMembers.map(m => m.playerId) }
    }
  });
}

function addMissingMemberships(
  groupId: number,
  missingPlayers: Player[],
  memberInputs: EditGroupParams['members']
): PrismaPromise<PrismaTypes.BatchPayload> {
  const roleMap: { [playerId: number]: GroupRole } = {};

  missingPlayers.forEach(player => {
    const role = memberInputs.find(m => standardize(m.username) === player.username)?.role;
    if (!role) return;

    roleMap[player.id] = role;
  });

  if (Object.keys(roleMap).length !== missingPlayers.length) {
    throw new ServerError('Failed to construct roleMap (EditGroupService: addMissingMemberships)');
  }

  return prisma.membership.createMany({
    data: missingPlayers.map(p => ({ playerId: p.id, groupId, role: roleMap[p.id] })),
    skipDuplicates: true
  });
}

function updateExistingRoles(
  groupId: number,
  keptPlayers: Player[],
  currentMemberships: (Membership & { player: PrismaPlayer })[],
  memberInputs: EditGroupParams['members']
): PrismaPromise<any>[] {
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

  return [...newRoleMap.keys()].map(role => {
    return prisma.membership.updateMany({
      where: {
        groupId,
        playerId: { in: newRoleMap.get(role) }
      },
      data: {
        role
      }
    });
  });
}

export { editGroup };
