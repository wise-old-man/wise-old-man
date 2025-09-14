import { isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import * as cryptService from '../../../../services/crypt.service';
import { Group, GroupRole, PlayerAnnotationType } from '../../../../types';
import { sanitizeWhitespace } from '../../../../utils/sanitize-whitespace.util';
import { BadRequestError, ForbiddenError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import { isValidUsername, sanitize, standardize } from '../../players/player.utils';
import { findOrCreatePlayers } from '../../players/services/FindOrCreatePlayersService';

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
): Promise<{
  group: Group;
  verificationCode: string;
}> {
  const name = sanitizeWhitespace(payload.name);
  const description = payload.description ? sanitizeWhitespace(payload.description) : null;
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

  if (payload.members.length > 0) {
    const optOuts = await prisma.playerAnnotation.findMany({
      where: {
        player: {
          username: {
            in: payload.members.map(m => standardize(m.username))
          }
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

  // Check for duplicate names
  const duplicateGroup = await prisma.group.findFirst({
    where: { name: { equals: name, mode: 'insensitive' } }
  });

  if (duplicateGroup) {
    throw new BadRequestError(`Group name '${name}' is already taken. (ID: ${duplicateGroup.id})`);
  }

  const generateVerificationResult = await cryptService.generateVerification();

  if (isErrored(generateVerificationResult)) {
    // TODO: When this file returns a fetchable, stop throwing here and just return the error
    throw generateVerificationResult.error.subError;
  }

  const { code, hash } = generateVerificationResult.value;

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

  eventEmitter.emit(EventType.GROUP_CREATED, { groupId: createdGroup.id });

  if (createdGroup.memberships.length > 0) {
    eventEmitter.emit(EventType.GROUP_MEMBERS_JOINED, {
      groupId: createdGroup.id,
      members: createdGroup.memberships.map(m => ({
        playerId: m.playerId,
        role: m.role
      }))
    });
  }

  return {
    group: createdGroup,
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
