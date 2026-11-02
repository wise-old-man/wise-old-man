import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Metric, Period, Player, Record } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

export async function findGroupRecords(
  groupId: number,
  metric: Metric,
  period: Period,
  pagination: PaginationOptions
): AsyncResult<Array<{ record: Record; player: Player }>, { code: 'GROUP_NOT_FOUND' }> {
  const groupAndMemberships = await prisma.group.findFirst({
    where: {
      id: groupId
    },
    include: {
      memberships: {
        select: {
          playerId: true
        }
      }
    }
  });

  if (groupAndMemberships === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  if (groupAndMemberships.memberships.length === 0) {
    return complete([]);
  }

  const records = await prisma.record.findMany({
    where: {
      playerId: {
        in: groupAndMemberships.memberships.map(m => m.playerId)
      },
      period,
      metric
    },
    include: { player: true },
    orderBy: [{ value: 'desc' }],
    take: pagination.limit,
    skip: pagination.offset
  });

  return complete(records.map(({ player, ...record }) => ({ player, record })));
}
