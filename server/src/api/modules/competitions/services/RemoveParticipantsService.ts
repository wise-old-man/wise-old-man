import { z } from 'zod';
import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError } from '../../../errors';
import * as playerServices from '../../players/player.services';

const inputSchema = z.object({
  id: z.number().positive(),
  participants: z
    .array(z.string(), {
      invalid_type_error: "Parameter 'participants' is not a valid array.",
      required_error: "Parameter 'participants' is undefined."
    })
    .nonempty({ message: 'Empty participants list.' })
});

type RemoveParticipantsParams = z.infer<typeof inputSchema>;

async function removeParticipants(payload: RemoveParticipantsParams): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

  const competition = await prisma.competition.findFirst({
    where: { id: params.id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.type === CompetitionType.TEAM) {
    throw new BadRequestError('Cannot remove participants from a team competition.');
  }

  const playersToRemove = await playerServices.findPlayers({
    usernames: params.participants
  });

  if (!playersToRemove || playersToRemove.length === 0) {
    throw new BadRequestError('No valid tracked players were given.');
  }

  const { count } = await prisma.participation.deleteMany({
    where: {
      competitionId: params.id,
      playerId: { in: playersToRemove.map(p => p.id) }
    }
  });

  if (!count) {
    throw new BadRequestError('None of the players given were competing.');
  }

  await prisma.competition.update({
    where: { id: params.id },
    data: { updatedAt: new Date() }
  });

  logger.moderation(`[Competition:${params.id}] (${playersToRemove.map(p => p.id)}) left`);

  return { count };
}

export { removeParticipants };
