import prisma from '../../../../prisma';
import { Metric, Period, Record, PlayerAnnotationType } from '../../../../types';
import { NotFoundError, ForbiddenError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

async function findPlayerRecords(username: string, period?: Period, metric?: Metric): Promise<Record[]> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: { annotations: true }
  });

  // TODO: refactor error handling
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player has opted out.');
  }

  const records = await prisma.record.findMany({
    where: {
      playerId: player.id,
      ...(period ? { period } : {}),
      ...(metric ? { metric } : {})
    },
    orderBy: { updatedAt: 'desc' }
  });

  return records;
}

export { findPlayerRecords };
