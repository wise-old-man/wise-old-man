import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { standardizeUsername } from '../../players/player.utils';

export async function removeParticipants(
  id: number,
  participants: string[]
): AsyncResult<{ count: number }, { code: 'COMPETITION_NOT_FOUND' } | { code: 'NO_VALID_PARTICIPANTS' }> {
  const competition = await prisma.competition.findFirst({
    where: { id }
  });

  if (competition === null) {
    return errored({ code: 'COMPETITION_NOT_FOUND' });
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

  if (playersToRemove.length === 0) {
    return errored({ code: 'NO_VALID_PARTICIPANTS' });
  }

  const deletionResult = await prisma.participation.deleteMany({
    where: {
      competitionId: id,
      playerId: { in: playersToRemove.map(p => p.id) }
    }
  });

  if (deletionResult.count === 0) {
    return errored({ code: 'NO_VALID_PARTICIPANTS' });
  }

  await prisma.competition.update({
    where: { id },
    data: { updatedAt: new Date() }
  });

  return complete(deletionResult);
}
