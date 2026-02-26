import prisma from '../../../../prisma';
import { Metric, Period, PlayerAnnotationType, Record } from '../../../../types';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

export async function findPlayerRecords(
  username: string,
  period?: Period,
  metric?: Metric
): Promise<Record[]> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: {
      records: {
        where: {
          ...(period && { period }),
          ...(metric && { metric })
        },
        orderBy: { updatedAt: 'desc' }
      },
      annotations: true
    }
  });

  // TODO: Refactor error handlign
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player has opted out.');
  }

  return player.records;
}
