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
  usernames?: string[];
  minDate?: Date;
  maxDate?: Date;
};

export async function fetchCompetitionDetails({
  id,
  metric,
  filter = {}
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
  if (filter.minDate && filter.maxDate && filter.minDate >= filter.maxDate) {
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

  // Deltas can only be calculated from within the competition's own period, so a filter
  // range that doesn't overlap with it has nothing to offer.
  if (
    (filter.minDate && filter.minDate >= competition.endsAt) ||
    (filter.maxDate && filter.maxDate <= competition.startsAt)
  ) {
    throw new BadRequestError("The given date range does not overlap with the competition's period.");
  }

  const competitionMetrics = competition.metrics.map(m => m.metric);

  const selectedMetrics = [
    ...competitionMetrics,
    ...(metric === undefined || competitionMetrics.includes(metric) ? [] : [metric])
  ];

  const participants = calculateParticipantDeltas(
    await fetchParticipantData(competition, selectedMetrics, filter),
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
  competition: Competition,
  metrics: Metric[],
  filter: Filter
): Promise<
  Array<
    Participation & {
      player: Player;
      startSnapshot: Snapshot | null;
      endSnapshot: Snapshot | null;
    }
  >
> {
  // Deltas are always bound to the competition's own period, so any filter dates
  // that reach outside of it get clamped into it. The range is guaranteed to overlap
  // with the period, so clamping can never collapse it into a single instant.
  const rangeStart = clampToPeriod(filter.minDate ?? competition.startsAt, competition);
  const rangeEnd = clampToPeriod(filter.maxDate ?? competition.endsAt, competition);

  // If the clamped range still covers the competition's own period, then the participations'
  // cached start/end snapshots already hold the answer, and we can skip querying for them.
  const useCachedStartSnapshots = rangeStart.getTime() === competition.startsAt.getTime();
  const useCachedEndSnapshots = rangeEnd.getTime() === competition.endsAt.getTime();

  const selectedSnapshotFields = selectRequiredSnapshotFields(metrics);

  const participants = await prisma.participation.findMany({
    where: {
      competitionId: competition.id,
      ...(filter.usernames && {
        player: {
          username: {
            in: filter.usernames.map(standardizeUsername)
          }
        }
      })
    },
    include: {
      player: true,
      ...(useCachedStartSnapshots && {
        startSnapshot: {
          select: selectedSnapshotFields
        }
      }),
      ...(useCachedEndSnapshots && {
        endSnapshot: {
          select: selectedSnapshotFields
        }
      })
    }
  });

  const startSnapshotMap = new Map<number, Snapshot>();
  const endSnapshotMap = new Map<number, Snapshot>();

  // Prisma types these relations as always present, but they're only fetched when
  // the flags above are true, so these checks are required.
  for (const p of participants) {
    if (p.startSnapshot) {
      startSnapshotMap.set(p.playerId, p.startSnapshot);
    }

    if (p.endSnapshot) {
      endSnapshotMap.set(p.playerId, p.endSnapshot);
    }
  }

  const snapshotFields = getRequiredSnapshotFields(metrics);
  const playerIds = participants.map(p => p.playerId);

  const [startSnapshots, endSnapshots] = await Promise.all([
    useCachedStartSnapshots
      ? []
      : findGroupSnapshots(playerIds, {
          pick: 'first',
          select: snapshotFields,
          minDate: rangeStart,
          maxDate: rangeEnd
        }),
    useCachedEndSnapshots
      ? []
      : findGroupSnapshots(playerIds, {
          pick: 'last',
          select: snapshotFields,
          minDate: rangeStart,
          maxDate: rangeEnd
        })
  ]);

  for (const snapshot of startSnapshots) {
    startSnapshotMap.set(snapshot.playerId, snapshot);
  }

  for (const snapshot of endSnapshots) {
    endSnapshotMap.set(snapshot.playerId, snapshot);
  }

  return participants.map(p => ({
    ...p,
    startSnapshot: startSnapshotMap.get(p.playerId) ?? null,
    endSnapshot: endSnapshotMap.get(p.playerId) ?? null
  }));
}

function clampToPeriod(date: Date, competition: Competition) {
  if (date.getTime() < competition.startsAt.getTime()) {
    return competition.startsAt;
  }

  if (date.getTime() > competition.endsAt.getTime()) {
    return competition.endsAt;
  }

  return date;
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
