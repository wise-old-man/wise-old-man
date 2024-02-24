import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';

async function removeParticipants(id: number, participants: string[]): Promise<{ count: number }> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  if (competition.type === CompetitionType.TEAM) {
    throw new BadRequestError('Cannot remove participants from a team competition.');
  }

  const playersToRemove = await prisma.player.findMany({
    where: {
      username: { in: participants.map(standardize) }
    },
    select: {
      id: true
    },
    orderBy: {
      username: 'asc'
    }
  });

  if (!playersToRemove || playersToRemove.length === 0) {
    throw new BadRequestError('No valid tracked players were given.');
  }

  const { count } = await prisma.participation.deleteMany({
    where: {
      competitionId: id,
      playerId: { in: playersToRemove.map(p => p.id) }
    }
  });

  if (!count) {
    throw new BadRequestError('None of the players given were competing.');
  }

  await prisma.competition.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  logger.moderation(`[Competition:${id}] (${playersToRemove.map(p => p.id)}) left`);

  return { count };
}

export { removeParticipants };
