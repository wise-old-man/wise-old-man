import { z } from 'zod';
import prisma from '../../../../prisma';
import { NotFoundError, BadRequestError } from '../../../errors';
import * as playerServices from '../../players/player.services';

const inputSchema = z.object({
  id: z.number().positive(),
  usernames: z.array(z.string(), {
    invalid_type_error: "Parameter 'members' is not a valid array."
  })
});

type RemoveMembersService = z.infer<typeof inputSchema>;

async function removeMembers(payload: RemoveMembersService): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

  if (params.usernames.length === 0) {
    throw new BadRequestError('Empty members list.');
  }

  const playersToRemove = await playerServices.findPlayers({
    usernames: params.usernames
  });

  if (!playersToRemove || !playersToRemove.length) {
    throw new BadRequestError('No valid tracked players were given.');
  }

  const { count } = await prisma.membership.deleteMany({
    where: {
      groupId: params.id,
      playerId: { in: playersToRemove.map(p => p.id) }
    }
  });

  if (!count) {
    throw new BadRequestError('None of the players given were members of that group.');
  }

  try {
    await prisma.group.update({
      where: { id: params.id },
      data: { updatedAt: new Date() }
    });
  } catch (error) {
    throw new NotFoundError('Group not found.');
  }

  return { count };
}

export { removeMembers };
