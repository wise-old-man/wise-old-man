import { omit } from '../../../util/objects';
import { Metric, Period, parsePeriodExpression } from '../../../../utils';
import prisma, { Player, Snapshot } from '../../../../prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { calculateMetricDelta } from '../delta.utils';
import { DeltaGroupLeaderboardEntry } from '../delta.types';
import { findGroupSnapshots } from '../../snapshots/services/FindGroupSnapshotsService';
import { PaginationOptions } from 'src/api/util/validation';

async function findGroupDeltas(
  groupId: number,
  metric: Metric,
  period?: Period | string,
  minDate?: Date,
  maxDate?: Date,
  pagination?: PaginationOptions
): Promise<DeltaGroupLeaderboardEntry[]> {
  if (!period && (!minDate || !maxDate)) {
    throw new BadRequestError('Invalid period and start/end dates.');
  }

  if (minDate && maxDate && minDate >= maxDate) {
    throw new BadRequestError('Min date must be before the max date.');
  }

  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: groupId },
    include: {
      memberships: {
        select: {
          player: {
            include: {
              // If fetching by period (not custom time range), the "end" snapshots will always be
              // the player's latest snapshots. So it's cheaper to just pull them from the latestSnapshotId relation
              latestSnapshot: !!period
            }
          }
        }
      }
    }
  });

  if (!groupAndMemberships) {
    throw new NotFoundError('Group not found.');
  }

  const playerSnapshotMap = await buildPlayerSnapshotMap(
    groupAndMemberships.memberships.map(m => m.player),
    period,
    minDate,
    maxDate
  );

  const results = Array.from(playerSnapshotMap.keys())
    .map(playerId => {
      const { player, startSnapshot, endSnapshot } = playerSnapshotMap.get(playerId);

      if (!player || !startSnapshot || !endSnapshot) {
        return null;
      }

      const data = calculateMetricDelta(player, metric, startSnapshot, endSnapshot);

      return {
        player: omit(player, 'latestSnapshot'),
        data,
        startDate: startSnapshot.createdAt,
        endDate: endSnapshot.createdAt
      };
    })
    .filter(r => r !== null)
    .sort((a, b) => b.data.gained - a.data.gained);

  if (pagination) {
    return results.slice(pagination.offset, pagination.offset + pagination.limit);
  }

  return results;
}

type PlayerMapValue = {
  player: Player & { latestSnapshot?: Snapshot };
  startSnapshot: Snapshot | null;
  endSnapshot: Snapshot | null;
};

async function buildPlayerSnapshotMap(
  players: Array<Player & { latestSnapshot?: Snapshot }>,
  period?: Period | string,
  minDate?: Date,
  maxDate?: Date
) {
  const playerIds = players.map(p => p.id);

  let startSnapshots: Snapshot[];
  let endSnapshots: Snapshot[];

  if (period) {
    startSnapshots = await findStartingSnapshots(playerIds, period);
    endSnapshots = players.map(p => p.latestSnapshot).filter(Boolean);
  } else {
    const [start, end] = await findEdgeSnapshots(playerIds, minDate, maxDate);
    startSnapshots = start;
    endSnapshots = end;
  }

  const playerMap = new Map<number, PlayerMapValue>(
    players.map(p => [p.id, { player: p, startSnapshot: null, endSnapshot: null }])
  );

  startSnapshots.forEach(s => {
    const current = playerMap.get(s.playerId);
    if (current) current.startSnapshot = s;
  });

  endSnapshots.forEach(s => {
    const current = playerMap.get(s.playerId);
    if (current) current.endSnapshot = s;
  });

  return playerMap;
}

async function findEdgeSnapshots(playerIds: number[], minDate: Date, maxDate: Date) {
  return await Promise.all([
    findGroupSnapshots({ playerIds, minDate }),
    findGroupSnapshots({ playerIds, maxDate })
  ]);
}

async function findStartingSnapshots(playerIds: number[], period: string) {
  const parsedPeriod = parsePeriodExpression(period);

  if (!parsedPeriod) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  return await findGroupSnapshots({
    playerIds,
    minDate: new Date(Date.now() - parsedPeriod.durationMs)
  });
}

export { findGroupDeltas };
