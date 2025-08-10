import prisma from '../../../../prisma';
import { Metric, Period, Player, Record } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';

async function findGroupRecords(
  groupId: number,
  metric: Metric,
  period: Period,
  pagination: PaginationOptions
): Promise<Array<{ record: Record; player: Player }>> {
  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: groupId },
    include: { memberships: { select: { playerId: true } } }
  });

  if (!groupAndMemberships) {
    throw new NotFoundError('Group not found.');
  }

  // Convert the memberships to an array of player IDs
  const playerIds = groupAndMemberships.memberships.map(m => m.playerId);

  if (playerIds.length === 0) {
    return [];
  }

  const records = await prisma.record.findMany({
    where: {
      playerId: { in: playerIds },
      period,
      metric
    },
    include: { player: true },
    orderBy: [{ value: 'desc' }],
    take: pagination.limit,
    skip: pagination.offset
  });

  return records.map(({ player, ...record }) => ({ player, record }));
}

export { findGroupRecords };
