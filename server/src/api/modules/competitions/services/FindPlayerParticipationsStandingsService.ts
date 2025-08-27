import prisma from '../../../../prisma';
import { Competition, CompetitionMetric, CompetitionStatus, Group, Participation } from '../../../../types';
import { MetricDelta } from '../../../../types/metric-delta.type';
import { calculateCompetitionDelta } from '../../../../utils/calculate-competition-delta.util';
import { getRequiredSnapshotFields } from '../../../../utils/get-required-snapshot-fields.util';
import { NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';

type ReturnType = {
  participation: Participation;
  competition: Competition & { metrics: CompetitionMetric[]; participantCount: number };
  group: (Group & { memberCount: number }) | null;
  progress: MetricDelta;
  levels: MetricDelta;
  rank: number;
};

async function findPlayerParticipationsStandings(
  username: string,
  status: CompetitionStatus.ONGOING | CompetitionStatus.FINISHED
): Promise<Array<ReturnType>> {
  const player = await prisma.player.findFirst({
    where: {
      username: standardize(username)
    }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  const now = new Date();

  // Find all ongoing or finished competitions the player is in
  const playerParticipations = await prisma.participation.findMany({
    where: {
      playerId: player.id,
      competition: {
        visible: true,
        ...(status === CompetitionStatus.FINISHED
          ? {
              endsAt: { lt: now }
            }
          : {
              startsAt: { lt: now },
              endsAt: { gt: now }
            })
      }
    },
    include: {
      competition: {
        include: {
          metrics: {
            where: {
              deletedAt: null
            },
            orderBy: {
              createdAt: 'asc'
            }
          }
        }
      }
    },
    orderBy: [{ competition: { score: 'desc' } }, { createdAt: 'desc' }]
  });

  if (playerParticipations.length === 0) {
    return [];
  }

  // Find all other players in those same competitions
  const allParticipations = await prisma.participation.findMany({
    where: {
      competitionId: { in: playerParticipations.map(p => p.competitionId) }
    }
  });

  /**
   * Clans can often have multiple competitions happening in parallel,
   * which means that players often have the same start and end snapshots for multiple competitions.
   * We can deduplicate those players and snapshots to reduce the number of queries we need to make.
   *
   * Example: If a 200 person group has 5 parallel competitions, we'd need to load 1000 player objects,
   * 1000 start snapshots, and 1000 end snapshots.
   *
   * By deduplicating those IDs, we can probably reduce that to 200 player objects, 200 start snapshots, and 200 end snapshots.
   */

  const dedupedStartSnapshotIds = new Set(allParticipations.map(p => p.startSnapshotId).filter(Boolean));
  const dedupedEndSnapshotIds = new Set(allParticipations.map(p => p.endSnapshotId).filter(Boolean));
  const dedupedPlayerIds = new Set(allParticipations.map(p => p.playerId).filter(Boolean));
  const dedupedGroupIds = new Set(playerParticipations.map(p => p.competition.groupId).filter(Boolean));

  const requiredSnapshotFields = getRequiredSnapshotFields(
    playerParticipations.map(p => p.competition.metrics.map(m => m.metric)).flat()
  );

  const allStartSnapshots = await prisma.snapshot.findMany({
    where: {
      id: { in: Array.from(dedupedStartSnapshotIds) }
    },
    select: {
      id: true,
      ...requiredSnapshotFields
    }
  });

  const allEndSnapshots = await prisma.snapshot.findMany({
    where: {
      id: { in: Array.from(dedupedEndSnapshotIds) }
    },
    select: {
      id: true,
      ...requiredSnapshotFields
    }
  });

  const allPlayers = await prisma.player.findMany({
    where: {
      id: { in: Array.from(dedupedPlayerIds) }
    }
  });

  const allGroups = await prisma.group.findMany({
    where: {
      id: { in: Array.from(dedupedGroupIds) },
      visible: true
    },
    include: {
      _count: {
        select: {
          memberships: true
        }
      }
    }
  });

  const startSnapshotMap = new Map(allStartSnapshots.map(s => [s.id, s]));
  const endSnapshotMap = new Map(allEndSnapshots.map(s => [s.id, s]));
  const playerMap = new Map(allPlayers.map(p => [p.id, p]));
  const groupMap = new Map(allGroups.map(g => [g.id, g]));

  const participationsPerCompetitionMap = new Map<number, Participation[]>();
  for (const participation of allParticipations) {
    const values = participationsPerCompetitionMap.get(participation.competitionId);

    if (values === undefined) {
      participationsPerCompetitionMap.set(participation.competitionId, [participation]);
    } else {
      values.push(participation);
    }
  }

  /**
   * Now that we've preloaded all the data, we will now calculate every player's progress
   * and sort them by their "gained" values.
   *
   * We can then find our target player in the sorted list to get their rank.
   */

  const results: Array<ReturnType> = [];

  for (const playerParticipation of playerParticipations) {
    const participations = participationsPerCompetitionMap.get(playerParticipation.competitionId);

    if (participations === undefined) {
      continue;
    }

    const emptyEntry = {
      startSnapshot: null,
      endSnapshot: null,
      progress: { gained: 0, start: -1, end: -1 },
      levels: { gained: 0, start: -1, end: -1 }
    };

    const metrics = playerParticipation.competition.metrics.map(m => m.metric);

    /**
     * Calculate each player's progress in the competition.
     * Sort them based on their "gained" value, their rank then becomes index + 1.
     */
    const sortedParticipants = participations
      .map(p => {
        if (p.startSnapshotId === null || p.endSnapshotId === null) {
          return {
            playerId: p.playerId,
            ...emptyEntry
          };
        }

        const player = playerMap.get(p.playerId);
        const startSnapshot = startSnapshotMap.get(p.startSnapshotId);
        const endSnapshot = endSnapshotMap.get(p.endSnapshotId);

        if (!player || !startSnapshot || !endSnapshot) {
          return {
            playerId: p.playerId,
            ...emptyEntry
          };
        }

        const { valuesDiff, levelsDiff } = calculateCompetitionDelta(
          metrics,
          player,
          startSnapshot,
          endSnapshot
        );

        return {
          playerId: p.playerId,
          progress: valuesDiff,
          levels: levelsDiff
        };
      })
      .sort(
        (a, b) =>
          b.progress.gained - a.progress.gained ||
          b.progress.start - a.progress.start ||
          a.playerId - b.playerId
      );

    // Find where our player is in the sorted list
    const targetPlayerIndex = sortedParticipants.findIndex(p => p.playerId === player.id);

    if (targetPlayerIndex === -1) {
      continue;
    }

    const targetPlayerParticipation = sortedParticipants[targetPlayerIndex];

    if (targetPlayerParticipation === null) {
      continue;
    }

    const rank = targetPlayerIndex + 1;
    const { progress, levels } = targetPlayerParticipation;

    if (rank <= 0) {
      continue;
    }

    const groupId = playerParticipation.competition.groupId;
    const group = groupId === null ? undefined : groupMap.get(groupId);

    // If it's a group competition and the group is not found, then it probably
    // means the group is not visible, and we should treat this competition as not visible as well.
    if (groupId !== null && group === undefined) {
      continue;
    }

    results.push({
      participation: playerParticipation,
      competition: {
        ...playerParticipation.competition,
        participantCount: participations.length
      },
      group:
        group === undefined
          ? null
          : {
              ...group,
              memberCount: group._count.memberships
            },
      rank,
      progress,
      levels
    });
  }

  return results.sort((a, b) => {
    if (status === CompetitionStatus.FINISHED) {
      return b.competition.endsAt.getTime() - a.competition.endsAt.getTime();
    } else {
      return a.competition.endsAt.getTime() - b.competition.endsAt.getTime();
    }
  });
}

export { findPlayerParticipationsStandings };
