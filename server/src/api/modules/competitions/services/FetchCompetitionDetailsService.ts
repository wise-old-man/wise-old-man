import prisma from '../../../../prisma';
import {
  Competition,
  CompetitionMetric,
  Group,
  Metric,
  Participation,
  Player,
  Skill
} from '../../../../types';
import { MetricDelta } from '../../../../types/metric-delta.type';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { isComputedMetric, isSkill } from '../../../../utils/shared';
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

  // TODO: default to "total" if no preview metric is provided (and has multiple metrics)
  const selectedMetric = metric || competition.metrics[0].metric;

  const participants = await calculateParticipantsStandings(id, selectedMetric);

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
  metric: Metric
): Promise<
  Array<{
    participation: Participation;
    player: Player;
    progress: MetricDelta;
    levels: MetricDelta;
  }>
> {
  const metricKey = getMetricValueKey(metric);

  // Overall (levels) and EHP/EHB require other stats to be fetched from the database to be computed
  const requiredSnapshotFields =
    isComputedMetric(metric) || metric === Skill.OVERALL ? true : { select: { [metricKey]: true } };

  const participations = await prisma.participation.findMany({
    where: { competitionId },
    include: {
      player: true,
      startSnapshot: requiredSnapshotFields,
      endSnapshot: requiredSnapshotFields
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

      const progress = deltaUtils.calculateMetricDelta(player, metric, startSnapshot, endSnapshot);

      const levels = isSkill(metric)
        ? deltaUtils.calculateLevelDiff(metric, startSnapshot, endSnapshot, progress)
        : { gained: 0, start: -1, end: -1 };

      return {
        participation,
        player,
        progress,
        levels
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
