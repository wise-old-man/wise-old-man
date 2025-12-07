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

import { BadRequestError, ForbiddenError, ServerError } from '../../../errors';
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

async function editGroup(groupId: number, payload: EditGroupPayload): Promise<Group> {
  const {
    name,
    clanChat,
    homeworld,
    description,
    members,
    bannerImage,
    profileImage,
    socialLinks,
    roleOrders
  } = payload;

  if (clanChat && !isValidUsername(clanChat)) {
    throw new BadRequestError("Invalid 'clanChat'. Cannot contain special characters.");
  }

  if (
    !name &&
    !clanChat &&
    !homeworld &&
    !description &&
    !members &&
    !bannerImage &&
    !profileImage &&
    !socialLinks &&
    !roleOrders
  ) {
    throw new BadRequestError('Nothing to update.');
  }

  const group = await prisma.group.findFirst({
    where: { id: groupId }
  });

  if (!group) {
    throw new BadRequestError('Group not found.');
  }

  if ((bannerImage || profileImage) && !group.patron) {
    throw new BadRequestError('Banner or profile images can only be uploaded by patron groups.');
  }

  if (socialLinks && !group.patron) {
    throw new BadRequestError('Social links can only be added to patron groups.');
  }

  if (
    (bannerImage && !bannerImage.startsWith(ALLOWED_IMAGE_PATH)) ||
    (profileImage && !profileImage.startsWith(ALLOWED_IMAGE_PATH))
  ) {
    throw new BadRequestError(
      'Cannot upload images from external sources. Please upload an image via the website.'
    );
  }

  if (roleOrders) {
    const uniqueIndexes = new Set(roleOrders.map(x => x.index));
    const uniqueRoles = new Set(roleOrders.map(x => x.role));

    if (uniqueIndexes.size < roleOrders.length) {
      throw new BadRequestError('Role Order must contain unique indexes for each role');
    }

    if (uniqueRoles.size < roleOrders.length) {
      throw new BadRequestError('Role Order must contain unique roles');
    }
  }

  const updatedGroupFields: PrismaTypes.GroupUpdateInput = {};

  if (bannerImage) {
    updatedGroupFields.bannerImage = bannerImage;
  }

  if (profileImage) {
    updatedGroupFields.profileImage = profileImage;
  }

  if (members) {
    const invalidUsernames = members.map(m => m.username).filter(u => !isValidUsername(u));

    if (invalidUsernames.length > 0) {
      throw new BadRequestError(
        `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
         contain no special characters, and/or contain no space at the beginning or end of the name.`,
        invalidUsernames
      );
    }
  }

  if (name) {
    const sanitizedName = sanitizeWhitespace(name);

    // Check for duplicate names
    const duplicateGroup = await prisma.group.findFirst({
      where: { name: { equals: sanitizedName, mode: 'insensitive' } }
    });

    if (duplicateGroup && duplicateGroup.id !== groupId) {
      throw new BadRequestError(`Group name '${sanitizedName}' is already taken. (ID: ${duplicateGroup.id})`);
    }

    updatedGroupFields.name = sanitizedName;
  }

  if (description) {
    updatedGroupFields.description = description ? sanitizeWhitespace(description) : null;
  }

  if (clanChat) {
    updatedGroupFields.clanChat = clanChat ? sanitize(clanChat) : null;
  }

  if (homeworld) {
    updatedGroupFields.homeworld = homeworld;
  }

  if (members) {
    await updateMembers(groupId, members);
  }

  await prisma
    .$transaction(async tx => {
      const transaction = tx as unknown as PrismaTypes.TransactionClient;

      if (socialLinks !== undefined) {
        await transaction.groupSocialLinks.upsert({
          where: {
            groupId
          },
          create: {
            groupId,
            ...socialLinks
          },
          update: {
            ...socialLinks
          }
        });
      }

      if (roleOrders !== undefined) {
        await transaction.groupRoleOrder.deleteMany({
          where: { groupId }
        });

        await transaction.groupRoleOrder.createMany({
          data: roleOrders.map(r => ({ ...r, groupId }))
        });
      }

      await transaction.group.update({
        where: {
          id: groupId
        },
        data: {
          ...updatedGroupFields,
          updatedAt: new Date() // Force update the "updatedAt" field
        }
      });
    })
    .catch(error => {
      logger.error('Failed to edit group', error);
      throw new ServerError('Failed to edit group details.');
    });

  const updatedGroup = await prisma.group.findFirst({
    where: { id: groupId },
    include: {
      memberships: {
        include: { player: true }
      },
      socialLinks: true,
      roleOrders: {
        orderBy: {
          index: 'asc'
        }
      }
    }
  });

  if (!updatedGroup) {
    throw new ServerError('Failed to edit group. (EditGroupService)');
  }

  eventEmitter.emit(EventType.GROUP_UPDATED, { groupId });

  return updatedGroup;
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

export { editGroup };
