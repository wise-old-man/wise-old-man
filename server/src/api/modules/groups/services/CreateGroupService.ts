import prisma from '../../../../prisma';
import { GroupRole, PRIVELEGED_GROUP_ROLES } from '../../../../utils';
import { BadRequestError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import * as cryptService from '../../../services/external/crypt.service';
import { omit } from '../../../util/objects';
import { isValidUsername, sanitize, standardize } from '../../players/player.utils';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';
import { onGroupCreated } from '../group.events';
import { GroupDetails } from '../group.types';
import { buildDefaultSocialLinks, sanitizeName } from '../group.utils';

type CreateGroupResult = { group: GroupDetails; verificationCode: string };

interface CreateGroupPayload {
  name: string;
  clanChat?: string;
  homeworld?: number;
  description?: string;
  members: Array<{ username: string; role: GroupRole }>;
}

async function createGroup(
  payload: CreateGroupPayload,
  creatorIpHash: string | null
): Promise<CreateGroupResult> {
  const name = sanitizeName(payload.name);
  const description = payload.description ? sanitizeName(payload.description) : null;
  const clanChat = payload.clanChat ? sanitize(payload.clanChat) : null;

  if (clanChat && !isValidUsername(clanChat)) {
    throw new BadRequestError("Invalid 'clanChat'. Cannot contain special characters.");
  }

  const invalidUsernames = payload.members.map(m => m.username).filter(u => !isValidUsername(u));

  if (invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  // Check for duplicate names
  const duplicateGroup = await prisma.group.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  });

  if (duplicateGroup) {
    throw new BadRequestError(`Group name '${name}' is already taken. (ID: ${duplicateGroup.id})`);
  }

  const [code, hash] = await cryptService.generateVerification();
  const memberships = await prepareMemberships(payload.members);

  const createdGroup = await prisma.group.create({
    data: {
      name,
      description,
      clanChat,
      homeworld: payload.homeworld,
      verificationHash: hash,
      creatorIpHash,
      memberships: {
        createMany: {
          data: memberships
        }
      }
    },
    include: {
      memberships: {
        include: {
          player: true
        }
      }
    }
  });

  onGroupCreated(createdGroup.id);

  if (createdGroup.memberships.length > 0) {
    eventEmitter.emit(EventType.GROUP_MEMBERS_JOINED, {
      groupId: createdGroup.id,
      members: createdGroup.memberships.map(m => ({
        playerId: m.playerId,
        role: m.role
      }))
    });
  }

  const priorities = [...PRIVELEGED_GROUP_ROLES].reverse();

  const sortedMemberships = createdGroup.memberships.sort(
    (a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role)
  );

  return {
    group: {
      ...omit(createdGroup, 'verificationHash'),
      socialLinks: buildDefaultSocialLinks(),
      memberCount: sortedMemberships.length,
      memberships: sortedMemberships,
      roleOrders: []
    },
    verificationCode: code
  };
}

async function prepareMemberships(members: CreateGroupPayload['members']) {
  if (!members || members.length === 0) return [];

  // Find or create all players with the given usernames
  const players = await findOrCreatePlayers(members.map(m => m.username));

  const usernameRoleMap = new Map<string, GroupRole>(members.map(m => [standardize(m.username), m.role]));

  return players.map(player => {
    return { playerId: player.id, role: usernameRoleMap.get(player.username)! };
  });
}

export { createGroup };
