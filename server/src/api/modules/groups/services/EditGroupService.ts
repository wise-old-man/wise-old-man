import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma, { PrismaTypes } from '../../../../prisma';
import logger from '../../../../services/logging.service';
import {
  Group,
  GroupRole,
  MemberActivityType,
  Membership,
  NameChangeStatus,
  Player,
  PlayerAnnotationType
} from '../../../../types';
import { sanitizeWhitespace } from '../../../../utils/sanitize-whitespace.util';

import { ForbiddenError, ServerError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import { isValidUsername, sanitize, standardize } from '../../players/player.utils';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';

// Only allow images from our Cloudflare R2 CDN, to make sure people don't
// upload unresize, or uncompressed images. They musgt edit images on the website.
const ALLOWED_IMAGE_PATH = 'https://img.wiseoldman.net';

interface EditGroupPayload {
  name?: string;
  clanChat?: string;
  homeworld?: number;
  description?: string;
  bannerImage?: string;
  profileImage?: string;
  socialLinks?: {
    website?: string | null;
    discord?: string | null;
    twitter?: string | null;
    twitch?: string | null;
    youtube?: string | null;
  };
  members?: Array<{ username: string; role: GroupRole }>;
  roleOrders?: Array<{ role: GroupRole; index: number }>;
}

export async function editGroup(
  groupId: number,
  payload: EditGroupPayload
): AsyncResult<
  Group,
  | { code: 'CLAN_CHAT_HAS_INVALID_CHARACTERS' }
  | { code: 'NOTHING_TO_UPDATE' }
  | { code: 'GROUP_NOT_FOUND' }
  | { code: 'GROUP_NOT_PATRON' }
  | { code: 'IMAGES_MUST_BE_INTERNALLY_HOSTED' }
  | { code: 'ROLE_ORDER_MUST_HAVE_UNIQUE_INDEXES' }
  | { code: 'ROLE_ORDER_MUST_HAVE_UNIQUE_ROLES' }
  | { code: 'GROUP_NAME_ALREADY_EXISTS' }
  | { code: 'FAILED_TO_UPDATE_GROUP' }
  | { code: 'INVALID_USERNAMES_FOUND'; data: string[] }
> {
  if (payload.clanChat !== undefined && !isValidUsername(payload.clanChat)) {
    return errored({ code: 'CLAN_CHAT_HAS_INVALID_CHARACTERS' });
  }

  if (
    payload.name === undefined &&
    payload.clanChat === undefined &&
    payload.homeworld === undefined &&
    payload.description === undefined &&
    payload.members === undefined &&
    payload.bannerImage === undefined &&
    payload.profileImage === undefined &&
    payload.socialLinks === undefined &&
    payload.roleOrders === undefined
  ) {
    return errored({ code: 'NOTHING_TO_UPDATE' });
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId }
  });

  if (group === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  if ((payload.bannerImage || payload.profileImage) && !group.patron) {
    return errored({ code: 'GROUP_NOT_PATRON' });
  }

  if (payload.socialLinks && !group.patron) {
    return errored({ code: 'GROUP_NOT_PATRON' });
  }

  if (
    (payload.bannerImage !== undefined && !payload.bannerImage.startsWith(ALLOWED_IMAGE_PATH)) ||
    (payload.profileImage !== undefined && !payload.profileImage.startsWith(ALLOWED_IMAGE_PATH))
  ) {
    return errored({ code: 'IMAGES_MUST_BE_INTERNALLY_HOSTED' });
  }

  if (payload.roleOrders) {
    const uniqueIndexes = new Set(payload.roleOrders.map(x => x.index));
    const uniqueRoles = new Set(payload.roleOrders.map(x => x.role));

    if (uniqueIndexes.size < payload.roleOrders.length) {
      return errored({ code: 'ROLE_ORDER_MUST_HAVE_UNIQUE_INDEXES' });
    }

    if (uniqueRoles.size < payload.roleOrders.length) {
      return errored({ code: 'ROLE_ORDER_MUST_HAVE_UNIQUE_ROLES' });
    }
  }

  const updatedGroupFields: PrismaTypes.GroupUpdateInput = {};

  if (payload.bannerImage) {
    updatedGroupFields.bannerImage = payload.bannerImage;
  }

  if (payload.profileImage) {
    updatedGroupFields.profileImage = payload.profileImage;
  }

  if (payload.members) {
    const invalidUsernames = payload.members.map(m => m.username).filter(u => !isValidUsername(u));

    if (invalidUsernames.length > 0) {
      return errored({
        code: 'INVALID_USERNAMES_FOUND',
        data: invalidUsernames
      });
    }
  }

  if (payload.name) {
    const sanitizedName = sanitizeWhitespace(payload.name);

    // Check for duplicate names
    const duplicateGroup = await prisma.group.findFirst({
      where: { name: { equals: sanitizedName, mode: 'insensitive' } }
    });

    if (duplicateGroup && duplicateGroup.id !== groupId) {
      return errored({ code: 'GROUP_NAME_ALREADY_EXISTS' });
    }

    updatedGroupFields.name = sanitizedName;
  }

  if (payload.description) {
    updatedGroupFields.description = payload.description ? sanitizeWhitespace(payload.description) : null;
  }

  if (payload.clanChat) {
    updatedGroupFields.clanChat = payload.clanChat ? sanitize(payload.clanChat) : null;
  }

  if (payload.homeworld) {
    updatedGroupFields.homeworld = payload.homeworld;
  }

  if (payload.members) {
    await updateMembers(groupId, payload.members);
  }

  const transactionResult = await fromPromise(
    prisma.$transaction(async tx => {
      const transaction = tx as unknown as PrismaTypes.TransactionClient;

      if (payload.socialLinks !== undefined) {
        await transaction.groupSocialLinks.upsert({
          where: {
            groupId
          },
          create: {
            groupId,
            ...payload.socialLinks
          },
          update: {
            ...payload.socialLinks
          }
        });
      }

      if (payload.roleOrders !== undefined) {
        await transaction.groupRoleOrder.deleteMany({
          where: { groupId }
        });

        await transaction.groupRoleOrder.createMany({
          data: payload.roleOrders.map(r => ({ ...r, groupId }))
        });
      }

      const updatedGroup = await transaction.group.update({
        where: {
          id: groupId
        },
        data: {
          ...updatedGroupFields,
          updatedAt: new Date() // Force update the "updatedAt" field
        }
      });

      return {
        updatedGroup
      };
    })
  );

  if (isErrored(transactionResult)) {
    logger.error('Failed to update group', transactionResult);
    return errored({ code: 'FAILED_TO_UPDATE_GROUP' });
    // // Prisma error
    // if (!('error' in transactionResult)) {
    //   logger.error('Failed to update group', transactionResult);
    //   return errored({ code: 'FAILED_TO_UPDATE_GROUP' });
    // }
    // // A little type coercion never hurt nobody...right?
    // return transactionResult as Errored<{
    //   code: 'OPTED_OUT_PLAYERS_FOUND';
    //   displayNames: string[];
    // }>;
  }

  eventEmitter.emit(EventType.GROUP_UPDATED, { groupId });

  return complete(transactionResult.value.updatedGroup);
}

async function updateMembers(groupId: number, members: Array<{ username: string; role: GroupRole }>) {
  const memberships = await prisma.membership.findMany({
    where: { groupId },
    include: { player: true }
  });

  // The usernames of all current (pre-edit) members
  const currentUsernames = memberships.map(m => m.player.username);

  // The usernames of all future (post-edit) members
  const nextUsernames = members.map(m => standardize(m.username));

  // These players should be added to the group
  const missingUsernames = nextUsernames.filter(u => !currentUsernames.includes(u));

  // These players should remain in the group
  const keptUsernames = nextUsernames.filter(u => currentUsernames.includes(u));

  // Find or create all players with the given usernames
  const nextPlayers = await findOrCreatePlayers(nextUsernames);

  const keptPlayers = nextPlayers.filter(p => keptUsernames.includes(p.username));
  const missingPlayers = nextPlayers.filter(p => missingUsernames.includes(p.username));

  if (missingPlayers.length > 0) {
    const optOuts = await prisma.playerAnnotation.findMany({
      where: {
        playerId: {
          in: missingPlayers.map(p => p.id)
        },
        type: {
          in: [PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_GROUPS]
        }
      },
      include: {
        player: {
          select: { displayName: true }
        }
      }
    });

    if (optOuts.length > 0) {
      throw new ForbiddenError(
        'One or more players have opted out of joining groups, so they cannot be added as members.',
        optOuts.map(o => o.player.displayName)
      );
    }
  }

  const leftEvents: Array<{
    groupId: number;
    playerId: number;
    role: GroupRole;
    type: typeof MemberActivityType.LEFT;
  }> = [];

  const joinedEvents: Array<{
    groupId: number;
    playerId: number;
    role: GroupRole;
    type: typeof MemberActivityType.JOINED;
  }> = [];

  const changedRoleEvents: Array<{
    groupId: number;
    playerId: number;
    role: GroupRole;
    previousRole: GroupRole;
    type: typeof MemberActivityType.CHANGED_ROLE;
  }> = [];

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
    .$transaction(async tx => {
      const transaction = tx as unknown as PrismaTypes.TransactionClient;

      const excessMemberships = await removeExcessMemberships(
        transaction,
        groupId,
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
          .map(m => ({
            groupId,
            playerId: m.playerId,
            role: m.role,
            type: MemberActivityType.LEFT
          }))
      );

      // Add any missing memberships
      const addedPlayerIds = await addMissingMemberships(transaction, groupId, missingPlayers, members);

      // Register "player joined" events
      joinedEvents.push(
        ...addedPlayerIds
          .filter(id => !ignoreFromJoined.includes(id.playerId))
          .map(j => ({
            groupId,
            playerId: j.playerId,
            role: j.role,
            type: MemberActivityType.JOINED
          }))
      );

      const roleUpdatesMap = calculateRoleChangeMaps(keptPlayers, memberships, members);

      const currentRoleMap = new Map<number, GroupRole>(
        Array.from(memberships).map(m => [m.playerId, m.role])
      );

      for (const role of roleUpdatesMap.keys()) {
        // Update all memberships with the new role
        await transaction.membership.updateMany({
          where: {
            groupId,
            playerId: { in: roleUpdatesMap.get(role) }
          },
          data: {
            role
          }
        });

        // Register "player role changed" events
        changedRoleEvents.push(
          ...roleUpdatesMap.get(role)!.map(id => ({
            groupId,
            playerId: id,
            role,
            previousRole: currentRoleMap.get(id)!,
            type: MemberActivityType.CHANGED_ROLE
          }))
        );
      }

      await transaction.memberActivity.createMany({
        data: [...leftEvents, ...joinedEvents, ...changedRoleEvents]
      });
    })
    .catch(error => {
      logger.error('Failed to edit group', error);
      throw new ServerError('Failed to edit group members.');
    });

  // If no error was thrown by this point, dispatch all events
  if (leftEvents.length > 0) {
    eventEmitter.emit(EventType.GROUP_MEMBERS_LEFT, {
      groupId,
      members: leftEvents.map(l => ({ playerId: l.playerId }))
    });
  }

  if (joinedEvents.length > 0) {
    eventEmitter.emit(EventType.GROUP_MEMBERS_JOINED, {
      groupId,
      members: joinedEvents.map(j => ({ playerId: j.playerId, role: j.role }))
    });
  }

  if (changedRoleEvents.length > 0) {
    eventEmitter.emit(EventType.GROUP_MEMBERS_ROLES_CHANGED, {
      groupId,
      members: changedRoleEvents.map(c => ({
        playerId: c.playerId,
        role: c.role,
        previousRole: c.previousRole
      }))
    });
  }
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
  memberInputs: Array<{ username: string; role: GroupRole }>
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
  memberInputs: Array<{ username: string; role: GroupRole }>
) {
  // Note: reversing the array here to find the role that was last declared for a given username
  const reversedInputs = [...memberInputs].reverse();

  const newRoleMap = new Map<GroupRole, number[]>();
  const currentRoleMap = new Map<GroupRole, number[]>();

  currentMemberships.forEach(m => {
    const current = currentRoleMap.get(m.role);
    if (current) {
      current.push(m.playerId);
    } else {
      currentRoleMap.set(m.role, [m.playerId]);
    }
  });

  keptPlayers.forEach(player => {
    // Find the next role for this player
    const role = reversedInputs.find(m => standardize(m.username) === player.username)?.role;

    if (!role) return;

    // Find the current membership for this player
    const membership = currentMemberships.find(m => m.playerId === player.id);

    // Check if the role has changed
    if (!membership || membership.role === role) return;

    // Player role hasn't changed
    if (currentRoleMap.get(role)?.includes(player.id)) return;

    const current = newRoleMap.get(role);

    if (current) {
      current.push(player.id);
    } else {
      newRoleMap.set(role, [player.id]);
    }
  });

  return newRoleMap;
}
