import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Metric, Period, PlayerAnnotationType, Record } from '../../../../types';
import { standardizeUsername } from '../../players/player.utils';

export async function findPlayerRecords(
  username: string,
  period?: Period,
  metric?: Metric
): AsyncResult<Record[], { code: 'PLAYER_NOT_FOUND' } | { code: 'PLAYER_OPTED_OUT' }> {
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

  if (!player) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    return errored({ code: 'PLAYER_OPTED_OUT' });
  }

  return complete(player.records);
}
