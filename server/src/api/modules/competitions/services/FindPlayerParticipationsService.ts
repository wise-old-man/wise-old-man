import prisma, { PrismaTypes } from '../../../../prisma';
import { Competition, CompetitionMetric, CompetitionStatus, Group, Participation } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';

async function findPlayerParticipations(
  username: string,
  status?: CompetitionStatus
): Promise<
  Array<{
    participation: Participation;
    competition: Competition & { metrics: CompetitionMetric[]; participantCount: number };
    group: (Group & { memberCount: number }) | null;
  }>
> {
  const competitionQuery: PrismaTypes.CompetitionWhereInput = {
    visible: true
  };

  const player = await prisma.player.findFirst({
    where: { username: standardize(username) },
    select: { id: true }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (status) {
    const now = new Date();

    if (status === CompetitionStatus.FINISHED) {
      competitionQuery.endsAt = { lt: now };
    } else if (status === CompetitionStatus.UPCOMING) {
      competitionQuery.startsAt = { gt: now };
    } else if (status === CompetitionStatus.ONGOING) {
      competitionQuery.startsAt = { lt: now };
      competitionQuery.endsAt = { gt: now };
    }
  }

  const participations = await prisma.participation.findMany({
    where: {
      playerId: player.id,
      competition: competitionQuery
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

  const groups = await prisma.group.findMany({
    where: {
      id: {
        in: participations.map(p => p.competition.groupId).filter(Boolean)
      },
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

  const participantCounts = await prisma.participation.groupBy({
    by: ['competitionId'],
    where: {
      competitionId: {
        in: participations.map(c => c.competitionId)
      }
    },
    _count: true
  });

  const groupsMap = new Map(groups.map(g => [g.id, g]));
  const participantCountsMap = new Map(participantCounts.map(p => [p.competitionId, p._count]));

  return sortCompetitions(
    participations
      .map(participation => {
        const group = participation.competition.groupId
          ? groupsMap.get(participation.competition.groupId)
          : undefined;

        // If it's a group competition and the group is not found, then it probably
        // means the group is not visible, and we should treat this competition as not visible as well.
        if (participation.competition.groupId !== null && group === undefined) {
          return null;
        }

        return {
          participation,
          competition: {
            ...participation.competition,
            participantCount: participantCountsMap.get(participation.competitionId) ?? 0
          },
          group: group
            ? {
                ...group,
                memberCount: group._count.memberships
              }
            : null
        };
      })
      .filter(Boolean)
  );
}

function sortCompetitions<T extends { competition: Pick<Competition, 'startsAt' | 'endsAt'> }>(
  participations: T[]
): T[] {
  const finished: T[] = [];
  const upcoming: T[] = [];
  const ongoing: T[] = [];

  participations.forEach(p => {
    if (p.competition.endsAt.getTime() < Date.now()) {
      finished.push(p);
    } else if (p.competition.startsAt.getTime() < Date.now()) {
      ongoing.push(p);
    } else {
      upcoming.push(p);
    }
  });

  return [
    ...ongoing.sort((a, b) => {
      return a.competition.endsAt.getTime() - b.competition.endsAt.getTime();
    }),
    ...upcoming.sort((a, b) => {
      return a.competition.startsAt.getTime() - b.competition.startsAt.getTime();
    }),
    ...finished.sort((a, b) => {
      return b.competition.endsAt.getTime() - a.competition.endsAt.getTime();
    })
  ];
}

export { findPlayerParticipations };
