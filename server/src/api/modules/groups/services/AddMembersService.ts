import { z } from 'zod';
import prisma from '../../../../prisma';
import { GroupRole } from '../../../../utils';
import logger from '../../../util/logging';
import { BadRequestError, ServerError } from '../../../errors';
import { isValidUsername, standardize } from '../../players/player.utils';
import * as playerServices from '../../players/player.services';

const MEMBER_INPUT_SCHEMA = z.object(
  {
    username: z.string(),
    role: z.nativeEnum(GroupRole).optional().default(GroupRole.MEMBER)
  },
  { invalid_type_error: 'Invalid members list. Must be an array of { username: string; role?: string; }.' }
);

const inputSchema = z.object({
  id: z.number().positive(),
  members: z
    .array(MEMBER_INPUT_SCHEMA, { invalid_type_error: "Parameter 'members' is not a valid array." })
    .nonempty({ message: 'Empty members list.' })
});

type AddMembersService = z.infer<typeof inputSchema>;

async function addMembers(payload: AddMembersService): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

  const invalidUsernames = params.members.map(m => m.username).filter(u => !isValidUsername(u));

  if (invalidUsernames.length > 0) {
    throw new BadRequestError(
      `Found ${invalidUsernames.length} invalid usernames: Names must be 1-12 characters long,
       contain no special characters, and/or contain no space at the beginning or end of the name.`,
      invalidUsernames
    );
  }

  // Find all existing members' ids
  const existingIds = (
    await prisma.membership.findMany({
      where: { groupId: params.id },
      select: { playerId: true }
    })
  ).map(p => p.playerId);

  // Find or create all players with the given usernames
  const players = await playerServices.findPlayers({
    usernames: params.members.map(m => m.username),
    createIfNotFound: true
  });

  // Filter out any already existing usersnames to find the new unique usernames
  const newPlayers = existingIds.length === 0 ? players : players.filter(p => !existingIds.includes(p.id));

  if (!newPlayers || newPlayers.length === 0) {
    throw new BadRequestError('All players given are already members.');
  }

  const newMemberships = newPlayers.map(player => {
    const role = params.members.find(m => standardize(m.username) === player.username)?.role;

    if (!role) return;

    return { groupId: params.id, playerId: player.id, role };
  });

  const { count } = await prisma.membership.createMany({
    data: newMemberships
  });

  try {
    await prisma.group.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    });
  } catch (error) {
    throw new ServerError('Failed to add members.');
  }

  logger.moderation(`[Group:${params.id}] (${newMemberships.map(m => m.playerId)}) joined`);

  return { count };
}

export { addMembers };
