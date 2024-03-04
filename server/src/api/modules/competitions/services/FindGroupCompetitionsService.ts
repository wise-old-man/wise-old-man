import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
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
    where: { groupId },
    include: {
      _count: {
        select: {
          participations: true
        }
      }
    }
  });

  return sortCompetitions(
    competitions.map(c => {
      return {
        ...omit(c, '_count', 'verificationHash'),
        group: {
          ...omit(group, '_count', 'verificationHash'),
          memberCount: group._count.memberships
        },
        participantCount: c._count.participations
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
