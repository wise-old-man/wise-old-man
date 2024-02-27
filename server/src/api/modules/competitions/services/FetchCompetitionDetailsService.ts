import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
import { getMetricValueKey, isComputedMetric, isSkill, Metric, Skill } from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { CompetitionDetails } from '../competition.types';
import * as deltaUtils from '../../deltas/delta.utils';

async function fetchCompetitionDetails(id: number, metric?: Metric): Promise<CompetitionDetails> {
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
    ...omit(competition, 'verificationHash'),
    group: competition.group
      ? {
          ...omit(competition.group, '_count', 'verificationHash'),
          memberCount: competition.group._count.memberships
        }
      : undefined,
    participantCount: participants.length,
    participations: participants
  };
}

async function calculateParticipantsStandings(competitionId: number, metric: Metric) {
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

      // Omit the snapshot information from the participation, as to not leak it in the API response
      const sanitizedParticipation = omit(
        p,
        'startSnapshotId',
        'endSnapshotId',
        'startSnapshot',
        'endSnapshot'
      );

      if (!startSnapshot || !endSnapshot) {
        return {
          ...sanitizedParticipation,
          progress: { gained: 0, start: -1, end: -1 },
          levels: { gained: 0, start: -1, end: -1 }
        };
      }

      const progress = deltaUtils.calculateMetricDelta(player, metric, startSnapshot, endSnapshot);

      const levels = isSkill(metric)
        ? deltaUtils.calculateLevelDiff(metric, startSnapshot, endSnapshot, progress)
        : { gained: 0, start: -1, end: -1 };

      return {
        ...sanitizedParticipation,
        progress,
        levels
      };
    })
    .sort((a, b) => b.progress.gained - a.progress.gained || b.progress.start - a.progress.start);
}

export { fetchCompetitionDetails, calculateParticipantsStandings };
