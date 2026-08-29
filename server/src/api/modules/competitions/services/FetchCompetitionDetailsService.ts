import prisma from '../../../../prisma';
import {
  Competition,
  CompetitionMetric,
  Group,
  Metric,
  Participation,
  Player,
  Snapshot
} from '../../../../types';
import { MetricDelta } from '../../../../types/metric-delta.type';
import { calculateCompetitionDelta } from '../../../../utils/calculate-competition-delta.util';
import {
  getRequiredSnapshotFields,
  selectRequiredSnapshotFields
} from '../../../../utils/get-required-snapshot-fields.util';
import { BadRequestError, NotFoundError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';
import { findGroupSnapshots } from '../../snapshots/services/FindGroupSnapshotsService';

type Filter = {
  usernames: string[];
  startDate: Date;
  endDate: Date;
};

export async function fetchCompetitionDetails({
  id,
  metric,
  filter
}: {
  id: number;
  metric?: Metric;
  filter?: Filter;
}): Promise<{
  competition: Competition;
  metrics: CompetitionMetric[];
  group: (Group & { memberCount: number }) | null;
  participations: Array<{
    participation: Participation;
    player: Player;
    deltas: Array<{
      metric: Metric | 'total';
      values: MetricDelta;
      levels: MetricDelta;
    }>;
  }>;
  sortingMetricIndex: number;
}> {
  if (filter && filter.startDate >= filter.endDate) {
    throw new BadRequestError('Min date must be before the max date.');
  }

  const competition = await prisma.competition.findFirst({
    where: {
      id
    },
    include: {
      group: {
        include: {
          _count: {
            select: {
              memberships: true
            }
          }
        }
      },
      metrics: {
        where: {
          deletedAt: null
        },
        orderBy: {
          createdAt: 'asc'
        }
      }
    }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  const competitionMetrics = competition.metrics.map(m => m.metric);

  const selectedMetrics = [
    ...competitionMetrics,
    ...(metric === undefined || competitionMetrics.includes(metric) ? [] : [metric])
  ];

  const participants = calculateParticipantDeltas(
    await fetchParticipantData(id, selectedMetrics, filter),
    selectedMetrics
  );

  /**
   * For backwards compat:
   * - If a preview metric is provided: we sort by that metric
   * - Else if competition has multiple metrics: we sort by the "total" (which is placed on index 0)
   * - Else: we sort by the single competition metric (which is also placed on index 0)
   */
  const sortingMetricIndex =
    metric === undefined || participants.length === 0
      ? 0
      : participants[0].deltas.findIndex(d => d.metric === metric);

  const sortedStandings = participants.sort(
    (a, b) =>
      b.deltas[sortingMetricIndex].values.gained - a.deltas[sortingMetricIndex].values.gained ||
      b.deltas[sortingMetricIndex].values.start - a.deltas[sortingMetricIndex].values.start ||
      a.player.id - b.player.id
  );

  return {
    competition,
    metrics: competition.metrics,
    group: competition.group
      ? {
          ...competition.group,
          memberCount: competition.group._count.memberships
        }
      : null,
    participations: sortedStandings,
    sortingMetricIndex
  };
}

async function fetchParticipantData(
  competitionId: number,
  metrics: Metric[],
  filter?: Filter
): Promise<
  Array<
    Participation & {
      player: Player;
      startSnapshot: Snapshot | null;
      endSnapshot: Snapshot | null;
    }
  >
> {
  if (filter === undefined) {
    const selectedSnapshotFields = selectRequiredSnapshotFields(metrics);

    return prisma.participation.findMany({
      where: {
        competitionId
      },
      include: {
        player: true,
        startSnapshot: {
          select: selectedSnapshotFields
        },
        endSnapshot: {
          select: selectedSnapshotFields
        }
      }
    });
  }

  const participants = await prisma.participation.findMany({
    where: {
      competitionId,
      player: {
        username: {
          in: filter.usernames.map(standardizeUsername)
        }
      }
    },
    include: {
      player: true
    }
  });

  const snapshotFields = getRequiredSnapshotFields(metrics);
  const playerIds = participants.map(p => p.playerId);

  const [startSnapshots, endSnapshots] = await Promise.all([
    findGroupSnapshots(playerIds, {
      pick: 'first',
      select: snapshotFields,
      minDate: filter.startDate,
      maxDate: filter.endDate
    }),
    findGroupSnapshots(playerIds, {
      pick: 'last',
      select: snapshotFields,
      minDate: filter.startDate,
      maxDate: filter.endDate
    })
  ]);

  const startSnapshotMap = new Map(startSnapshots.map(s => [s.playerId, s]));
  const endSnapshotMap = new Map(endSnapshots.map(s => [s.playerId, s]));

  return participants.map(p => ({
    ...p,
    startSnapshot: startSnapshotMap.get(p.playerId) ?? null,
    endSnapshot: endSnapshotMap.get(p.playerId) ?? null
  }));
}

function calculateParticipantDeltas(
  participants: Array<
    Participation & {
      player: Player;
      startSnapshot: Snapshot | null;
      endSnapshot: Snapshot | null;
    }
  >,
  metrics: Metric[]
) {
  const includeTotalDeltas = metrics.length > 1;

  return participants.map(p => {
    const { player, startSnapshot, endSnapshot, ...participation } = p;

    if (!startSnapshot || !endSnapshot) {
      const emptyDeltas = [...(includeTotalDeltas ? ['total' as const] : []), ...metrics].map(metric => ({
        metric,
        values: { gained: 0, start: -1, end: -1 },
        levels: { gained: 0, start: -1, end: -1 }
      }));

      return {
        participation,
        player,
        deltas: emptyDeltas
      };
    }

    const deltas: Array<{
      metric: Metric | 'total';
      values: MetricDelta;
      levels: MetricDelta;
    }> = [];

    if (includeTotalDeltas) {
      // Calculate "total" deltas
      const { valuesDiff, levelsDiff } = calculateCompetitionDelta(
        metrics,
        player,
        startSnapshot,
        endSnapshot
      );

      deltas.push({
        metric: 'total',
        values: valuesDiff,
        levels: levelsDiff
      });
    }

    // Calculate deltas for each metric separately
    for (const metric of metrics) {
      const { valuesDiff, levelsDiff } = calculateCompetitionDelta(
        [metric],
        player,
        startSnapshot,
        endSnapshot
      );

      deltas.push({
        metric,
        values: valuesDiff,
        levels: levelsDiff
      });
    }

    return {
      participation,
      player,
      deltas
    };
  });
}
