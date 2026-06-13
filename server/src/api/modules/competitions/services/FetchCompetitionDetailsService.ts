import prisma from '../../../../prisma';
import { Competition, CompetitionMetric, Group, Metric, Participation, Player } from '../../../../types';
import { MetricDelta } from '../../../../types/metric-delta.type';
import { calculateCompetitionDelta } from '../../../../utils/calculate-competition-delta.util';
import { getRequiredSnapshotFields } from '../../../../utils/get-required-snapshot-fields.util';
import { NotFoundError } from '../../../errors';

export async function fetchCompetitionDetails(
  id: number,
  metric?: Metric
): Promise<{
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

  const participants = await calculateParticipantDeltas(id, selectedMetrics);

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

async function calculateParticipantDeltas(
  competitionId: number,
  metrics: Metric[]
): Promise<
  Array<{
    participation: Participation;
    player: Player;
    deltas: Array<{
      metric: Metric | 'total';
      values: MetricDelta;
      levels: MetricDelta;
    }>;
  }>
> {
  const requiredSnapshotFields = getRequiredSnapshotFields(metrics);

  const participations = await prisma.participation.findMany({
    where: { competitionId },
    include: {
      player: true,
      startSnapshot: {
        select: requiredSnapshotFields
      },
      endSnapshot: {
        select: requiredSnapshotFields
      }
    }
  });

  const includeTotalDeltas = metrics.length > 1;

  return participations.map(p => {
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
