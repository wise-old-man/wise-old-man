import prisma from '../../../../prisma';
import { Competition, Group, Metric, Participation, Player, Skill } from '../../../../types';
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
  group: (Group & { memberCount: number }) | null;
  participations: Array<
    Participation & {
      player: Player;
      progress: MetricDelta;
      levels: MetricDelta;
    }
  >;
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
      }
    }
  });

  if (!competition) {
    throw new NotFoundError('Competition not found.');
  }

  const participants = await calculateParticipantsStandings(id, metric || competition.metric);

  return {
    competition,
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
  Array<
    Participation & {
      player: Player;
      progress: MetricDelta;
      levels: MetricDelta;
    }
  >
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
      const { player, startSnapshot, endSnapshot } = p;

      if (!startSnapshot || !endSnapshot) {
        return {
          ...p,
          progress: { gained: 0, start: -1, end: -1 },
          levels: { gained: 0, start: -1, end: -1 }
        };
      }

      const progress = deltaUtils.calculateMetricDelta(player, metric, startSnapshot, endSnapshot);

      const levels = isSkill(metric)
        ? deltaUtils.calculateLevelDiff(metric, startSnapshot, endSnapshot, progress)
        : { gained: 0, start: -1, end: -1 };

      return {
        ...p,
        progress,
        levels
      };
    })
    .sort(
      (a, b) =>
        b.progress.gained - a.progress.gained ||
        b.progress.start - a.progress.start ||
        a.playerId - b.playerId
    );
}

export { fetchCompetitionDetails };
