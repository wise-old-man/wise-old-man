import prisma from '../../../../prisma';
import { Competition, CompetitionMetric, Group, Metric, Participation, Player } from '../../../../types';
import { MetricDelta } from '../../../../types/metric-delta.type';
import { calculateCompetitionDelta } from '../../../../utils/calculate-competition-delta.util';
import { getRequiredSnapshotFields } from '../../../../utils/get-required-snapshot-fields.util';
import { NotFoundError } from '../../../errors';

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

  const selectedMetrics = metric !== undefined ? [metric] : competition.metrics.map(m => m.metric);
  const participants = await calculateParticipantsStandings(id, selectedMetrics);

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

      const { valuesDiff, levelsDiff } = calculateCompetitionDelta(
        metrics,
        player,
        startSnapshot,
        endSnapshot
      );

      return {
        participation,
        player,
        progress: valuesDiff,
        levels: levelsDiff
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
