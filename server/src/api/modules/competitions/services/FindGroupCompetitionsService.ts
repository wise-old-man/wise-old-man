import prisma from '../../../../prisma';
import { omit } from '../../../../utils/omit.util';
import { NotFoundError } from '../../../errors';
import { CompetitionListItem } from '../competition.types';

async function findGroupCompetitions(groupId: number): Promise<CompetitionListItem[]> {
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
    where: { groupId }
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
        ...omit(c, 'verificationHash'),
        group: {
          ...omit(group, '_count', 'verificationHash'),
          memberCount: group._count.memberships
        },
        participantCount: participantCountsMap.get(c.id) ?? 0
      };
    })
  );
}

function sortCompetitions(competitions: CompetitionListItem[]): CompetitionListItem[] {
  const finished: CompetitionListItem[] = [];
  const upcoming: CompetitionListItem[] = [];
  const ongoing: CompetitionListItem[] = [];

  competitions.forEach(c => {
    if (c.endsAt.getTime() < Date.now()) {
      finished.push(c);
    } else if (c.startsAt.getTime() < Date.now()) {
      ongoing.push(c);
    } else {
      upcoming.push(c);
    }
  });

  return [
    ...ongoing.sort((a, b) => {
      return a.endsAt.getTime() - b.endsAt.getTime();
    }),
    ...upcoming.sort((a, b) => {
      return a.startsAt.getTime() - b.startsAt.getTime();
    }),
    ...finished.sort((a, b) => {
      return b.endsAt.getTime() - a.endsAt.getTime();
    })
  ];
}

export { findGroupCompetitions };
