import prisma from '../../../../prisma';
import { Competition, CompetitionMetric, Group } from '../../../../types';
import { NotFoundError } from '../../../errors';

async function findGroupCompetitions(groupId: number): Promise<
  Array<{
    competition: Competition & { metrics: CompetitionMetric[]; participantCount: number };
    group: Group & { memberCount: number };
  }>
> {
  const group = await prisma.group.findFirst({
    where: { id: groupId },
    include: {
      _count: {
        select: {
          memberships: true
        }
      }
    }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  const competitions = await prisma.competition.findMany({
    where: {
      groupId
    },
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
  });

  const participantCounts = await prisma.participation.groupBy({
    by: ['competitionId'],
    where: {
      competitionId: {
        in: competitions.map(c => c.id)
      }
    },
    _count: true
  });

  const participantCountsMap = new Map(participantCounts.map(p => [p.competitionId, p._count]));

  return sortCompetitions(
    competitions.map(c => {
      return {
        competition: {
          ...c,
          participantCount: participantCountsMap.get(c.id) ?? 0
        },
        group: {
          ...group,
          memberCount: group._count.memberships
        }
      };
    })
  );
}

function sortCompetitions<T extends { competition: Pick<Competition, 'startsAt' | 'endsAt'> }>(
  competitions: T[]
): T[] {
  const finished: T[] = [];
  const upcoming: T[] = [];
  const ongoing: T[] = [];

  competitions.forEach(c => {
    if (c.competition.endsAt.getTime() < Date.now()) {
      finished.push(c);
    } else if (c.competition.startsAt.getTime() < Date.now()) {
      ongoing.push(c);
    } else {
      upcoming.push(c);
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

export { findGroupCompetitions };
