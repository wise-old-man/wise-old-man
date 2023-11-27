import { z } from 'zod';
import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
import {
  getMetricValueKey,
  isComputedMetric,
  isSkill,
  MeasuredDeltaProgress,
  Metric,
  Skill
} from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { CompetitionDetails } from '../competition.types';
import * as deltaUtils from '../../deltas/delta.utils';

const inputSchema = z.object({
  id: z.number().int().positive(),
  metric: z.nativeEnum(Metric).optional()
});

type FetchCompetitionDetailsParams = z.infer<typeof inputSchema>;

async function fetchCompetitionDetails(payload: FetchCompetitionDetailsParams): Promise<CompetitionDetails> {
  const params = inputSchema.parse(payload);

  const competition = await prisma.competition.findFirst({
    where: {
      id: params.id
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

  const participants = await calculateParticipantsStandings(params.id, params.metric || competition.metric);

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

      const diff = deltaUtils.calculateMetricDelta(player, metric, startSnapshot, endSnapshot);

      const standing = {
        ...omit(p, 'startSnapshotId', 'endSnapshotId', 'startSnapshot', 'endSnapshot'),
        progress: diff,
        levels: undefined as MeasuredDeltaProgress | undefined
      };

      if (isSkill(metric) && startSnapshot && endSnapshot) {
        standing.levels = deltaUtils.calculateLevelDiff(metric, startSnapshot, endSnapshot, diff);
      } else {
        standing.levels = { gained: 0, start: -1, end: -1 };
      }

      return standing;
    })
    .sort((a, b) => b.progress.gained - a.progress.gained || b.progress.start - a.progress.start);
}

export { fetchCompetitionDetails, calculateParticipantsStandings };
