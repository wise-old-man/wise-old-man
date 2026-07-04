import { AsyncResult, complete, errored, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Metric, METRICS, Period, Player, Snapshot } from '../../../../types';
import { MetricDelta } from '../../../../types/metric-delta.type';
import { parsePeriodExpression } from '../../../../utils/shared';
import { findGroupSnapshots } from '../../snapshots/services/FindGroupSnapshotsService';
import { calculateMetricDelta } from '../delta.utils';

type TimeFilter =
  | {
      period: Period | string;
    }
  | {
      minDate: Date;
      maxDate: Date;
    };

export async function findBulkGroupDeltas(
  groupId: number,
  timeFilter: TimeFilter
): AsyncResult<
  Array<{
    player: Player;
    startDate: Date;
    endDate: Date;
    data: Array<MetricDelta & { metric: Metric }>;
  }>,
  { code: 'GROUP_NOT_FOUND' } | { code: 'INVALID_DATE_RANGE' } | { code: 'INVALID_PERIOD' }
> {
  if (!('period' in timeFilter) && timeFilter.minDate >= timeFilter.maxDate) {
    return errored({ code: 'INVALID_DATE_RANGE' });
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
              // the player's latest snapshots. So it's cheaper to just pull them from the "latestSnapshot" relation
              latestSnapshot: 'period' in timeFilter
            }
          }
        }
      }
    }
  });

  if (groupAndMemberships === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  const playerSnapshotMapResult = await buildPlayerSnapshotMap(
    groupAndMemberships.memberships.map(m => m.player),
    timeFilter
  );

  if (isErrored(playerSnapshotMapResult)) {
    return playerSnapshotMapResult;
  }

  const results = Array.from(playerSnapshotMapResult.value.keys())
    .map(playerId => {
      const { player, startSnapshot, endSnapshot } = playerSnapshotMapResult.value.get(playerId)!;

      if (!player || !startSnapshot || !endSnapshot) {
        return null;
      }

      const data = METRICS.map(metric => {
        return {
          metric,
          ...calculateMetricDelta(player, metric, startSnapshot, endSnapshot)
        };
      });

      return {
        player,
        data,
        startDate: startSnapshot.createdAt,
        endDate: endSnapshot.createdAt
      };
    })
    .filter(Boolean);

  return complete(results);
}

async function buildPlayerSnapshotMap(
  players: Array<Player & { latestSnapshot: Snapshot | null }>,
  timeFilter: TimeFilter
) {
  const playerIds = players.map(p => p.id);

  let startSnapshots: Snapshot[];
  let endSnapshots: Snapshot[];

  if ('period' in timeFilter) {
    const parsedPeriod = parsePeriodExpression(timeFilter.period);

    if (!parsedPeriod) {
      return errored({ code: 'INVALID_PERIOD' as const });
    }

    startSnapshots = await findGroupSnapshots(playerIds, {
      minDate: new Date(Date.now() - parsedPeriod.durationMs)
    });

    endSnapshots = players.map(p => p.latestSnapshot).filter(Boolean);
  } else {
    const [start, end] = await Promise.all([
      findGroupSnapshots(playerIds, { minDate: timeFilter.minDate }),
      findGroupSnapshots(playerIds, { maxDate: timeFilter.maxDate })
    ]);

    startSnapshots = start;
    endSnapshots = end;
  }

  const playerMap = new Map(
    players.map(player => {
      return [
        player.id,
        {
          player,
          startSnapshot: null as Snapshot | null,
          endSnapshot: null as Snapshot | null
        }
      ];
    })
  );

  startSnapshots.forEach(s => {
    const current = playerMap.get(s.playerId);
    if (current) current.startSnapshot = s;
  });

  endSnapshots.forEach(s => {
    const current = playerMap.get(s.playerId);
    if (current) current.endSnapshot = s;
  });

  return complete(playerMap);
}
