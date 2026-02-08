import prisma from '../../../../prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

async function removeParticipants(id: number, participants: string[]): Promise<{ count: number }> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  const playersToRemove = await prisma.player.findMany({
    where: {
      username: { in: participants.map(standardizeUsername) }
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

  const count = await prisma.$transaction(async transaction => {
    const { count: removedCount } = await transaction.participation.deleteMany({
      where: {
        competitionId: id,
        playerId: { in: playersToRemove.map(p => p.id) }
      }
    });

    const newParticipantCount = await transaction.participation.count({
      where: {
        competitionId: id
      }
    });

    if (newParticipantCount === 0) {
      throw new BadRequestError('You cannot remove all competition participants.');
    }

    return removedCount;
  });

  if (count === 0) {
    throw new BadRequestError('None of the players given were competing.');
  }

  await prisma.competition.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  return { count };
}

export { removeParticipants };
