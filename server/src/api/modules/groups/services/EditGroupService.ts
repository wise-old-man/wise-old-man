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
import { buildDefaultSocialLinks, sanitizeName } from '../group.utils';
import { onMembersRolesChanged, onMembersJoined, onMembersLeft, onGroupUpdated } from '../group.events';
import { findPlayers } from '../../players/services/FindPlayersService';

// Only allow images from our DigitalOcean bucket CDN, to make sure people don't
// upload unresize, or uncompressed images. They musgt edit images on the website.
const ALLOWED_IMAGE_PATH = 'https://wiseoldman.ams3.cdn.digitaloceanspaces.com';

interface EditGroupPayload {
  name?: string;
  clanChat?: string;
  homeworld?: number;
  description?: string;
  bannerImage?: string;
  profileImage?: string;
  socialLinks?: {
    website?: string;
    discord?: string;
    twitter?: string;
    twitch?: string;
    youtube?: string;
  };
  members?: Array<{ username: string; role?: GroupRole }>;
}

async function editGroup(groupId: number, payload: EditGroupPayload): Promise<GroupDetails> {
  const { name, clanChat, homeworld, description, members, bannerImage, profileImage, socialLinks } = payload;

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
    !socialLinks
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
    const sanitizedName = sanitizeName(name);

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
    updatedGroupFields.description = description ? sanitizeName(description) : null;
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

      if (payload.socialLinks) {
        await updateSocialLinks(groupId, socialLinks, transaction);
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
      socialLinks: true
    }
  });

  if (!updatedGroup) {
    throw new ServerError('Failed to edit group. (EditGroupService)');
  }

  onGroupUpdated(groupId);

  logger.moderation(`[Group:${groupId}] Edited`);

  const priorities = [...PRIVELEGED_GROUP_ROLES].reverse();

  const sortedMemberships = updatedGroup.memberships.sort(
    (a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role)
  );

  return {
    ...omit(updatedGroup, 'verificationHash'),
    socialLinks: updatedGroup.socialLinks[0] ?? buildDefaultSocialLinks(),
    memberCount: sortedMemberships.length,
    memberships: sortedMemberships
  };
}

async function updateMembers(groupId: number, members: EditGroupPayload['members']) {
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
  const nextPlayers = await findPlayers({
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
          .map(m => ({ playerId: m.playerId, groupId: m.groupId, type: ActivityType.LEFT }))
      );

      // Add any missing memberships
      const addedPlayerIds = await addMissingMemberships(transaction, groupId, missingPlayers, members);

      // Register "player joined" events
      joinedEvents.push(
        ...addedPlayerIds
          .filter(id => !ignoreFromJoined.includes(id.playerId))
          .map(pId => ({ ...pId, type: ActivityType.JOINED }))
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
          ...roleUpdatesMap.get(role).map(id => ({
            playerId: id,
            groupId,
            role,
            type: ActivityType.CHANGED_ROLE,
            previousRole: currentRoleMap.get(id)
          }))
        );
      }

      await transaction.memberActivity.createMany({
        data: [
          ...leftEvents,
          ...joinedEvents.map(a => ({ ...a, role: null })),
          ...changedRoleEvents.map(p => omit(p, 'previousRole'))
        ]
      });
    })
    .catch(error => {
      logger.error('Failed to edit group', error);
      throw new ServerError('Failed to edit group members.');
    });

  // If no error was thrown by this point, dispatch all events
  if (leftEvents.length > 0) onMembersLeft(leftEvents);
  if (joinedEvents.length > 0) onMembersJoined(joinedEvents);
  if (changedRoleEvents.length > 0) onMembersRolesChanged(changedRoleEvents);
}

async function updateSocialLinks(
  groupId: number,
  socialLinks: EditGroupPayload['socialLinks'],
  transaction: PrismaTypes.TransactionClient
) {
  const existingId = await prisma.$queryRaw`
    SELECT "id" FROM public."groupSocialLinks" WHERE "groupId" = ${groupId} LIMIT 1
  `.then(rows => {
    return rows && Array.isArray(rows) && rows.length > 0 ? rows[0].id : null;
  });

  if (!existingId) {
    await transaction.groupSocialLinks.create({
      data: { ...socialLinks, groupId }
    });

    return;
  }

  await transaction.groupSocialLinks.update({
    where: { id: existingId },
    data: socialLinks
  });
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
  memberInputs: EditGroupPayload['members']
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
  memberInputs: EditGroupPayload['members']
) {
  // Note: reversing the array here to find the role that was last declared for a given username
  const reversedInputs = [...memberInputs].reverse();

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
