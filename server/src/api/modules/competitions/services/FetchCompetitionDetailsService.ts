import prisma from '../../../../prisma';
import { Competition, CompetitionMetric, Group, Metric, Participation, Player } from '../../../../types';
import { MetricDelta } from '../../../../types/metric-delta.type';
import { getRequiredSnapshotFields } from '../../../../utils/get-required-snapshot-fields.util';
import { isSkill } from '../../../../utils/shared';
import { NotFoundError } from '../../../errors';
import * as deltaUtils from '../../deltas/delta.utils';

async function fetchCompetitionDetails(
  id: number,
  metric?: Metric
): Promise<{
  competition: Competition;
  metrics: CompetitionMetric[];
  group: (Group & { memberCount: number }) | null;
  participations: Array<{
    participation: Participation;
    player: Player;
    progress: MetricDelta;
    levels: MetricDelta;
  }>;
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

  const participants = await calculateParticipantsStandings(
    id,
    metric !== undefined ? [metric] : competition.metrics.map(m => m.metric)
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
    participations: participants
  };
}

async function calculateParticipantsStandings(
  competitionId: number,
  metrics: Metric[]
): Promise<
  Array<{
    participation: Participation;
    player: Player;
    progress: MetricDelta;
    levels: MetricDelta;
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

  return participations
    .map(p => {
      const { player, startSnapshot, endSnapshot, ...participation } = p;

      if (!startSnapshot || !endSnapshot) {
        return {
          participation,
          player,
          progress: { gained: 0, start: -1, end: -1 },
          levels: { gained: 0, start: -1, end: -1 }
        };
      }

      const valuesSum: MetricDelta = { gained: 0, start: 0, end: 0 };
      const levelsSum: MetricDelta = { gained: 0, start: 0, end: 0 };

      for (const metric of metrics) {
        const valuesDiff = deltaUtils.calculateMetricDelta(player, metric, startSnapshot, endSnapshot);

        valuesSum.end += Math.max(0, valuesDiff.end);
        valuesSum.start += Math.max(0, valuesDiff.start);
        valuesSum.gained += Math.max(0, valuesDiff.gained);

        if (isSkill(metric)) {
          const levelsDiff = deltaUtils.calculateLevelDiff(metric, startSnapshot, endSnapshot, valuesDiff);

          levelsSum.end += Math.max(0, levelsDiff.end);
          levelsSum.start += Math.max(0, levelsDiff.start);
          levelsSum.gained += Math.max(0, levelsDiff.gained);
        }
      }

      // If was unranked in all metrics, set the total to -1
      if (valuesSum.start === 0) valuesSum.start = -1;
      if (valuesSum.end === 0) valuesSum.end = -1;
      if (levelsSum.start === 0) levelsSum.start = -1;
      if (levelsSum.end === 0) levelsSum.end = -1;

      return {
        participation,
        player,
        progress: valuesSum,
        levels: levelsSum
      };
    })
    .sort(
      (a, b) =>
        b.progress.gained - a.progress.gained ||
        b.progress.start - a.progress.start ||
        a.player.id - b.player.id
    );
}

export { fetchCompetitionDetails };
