import { z } from 'zod';
import prisma from '../../../../prisma';
import { ServerError, BadRequestError } from '../../../errors';
import logger from '../../../util/logging';
import { ActivityType } from '../../../../prisma/enum-adapter';
import * as playerServices from '../../players/player.services';
import * as groupEvents from '../group.events';

const inputSchema = z.object({
  id: z.number().positive(),
  usernames: z
    .array(z.string(), { invalid_type_error: "Parameter 'members' is not a valid array." })
    .nonempty({ message: 'Empty members list.' })
});

type RemoveMembersService = z.infer<typeof inputSchema>;

async function removeMembers(payload: RemoveMembersService): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

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
    throw new ServerError('Failed to remove members.');
  }

  const newActivites = playersToRemove.map(player => {
    return {
      groupId: params.id,
      playerId: player.id,
      type: ActivityType.LEFT
    };
  });

  try {
    await prisma.memberActivity.createMany({ data: newActivites }).then(
      async () =>
        await groupEvents.onMembersLeft(
          params.id,
          playersToRemove.map(p => p.id)
        )
    );
  } catch (error) {
    throw new ServerError('Failed to create left member activities');
  }

  logger.moderation(`[Group:${params.id}] (${playersToRemove.map(p => p.id)}) removed`);

  return { count };
}

export { removeMembers };
