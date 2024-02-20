import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
import { NotFoundError } from '../../../errors';
import { CompetitionListItem } from '../competition.types';

async function findGroupCompetitions(groupId: number): Promise<CompetitionListItem[]> {
  const competitions = await prisma.competition.findMany({
    where: { groupId },
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
      _count: {
        select: {
          participations: true
        }
      }
    }
  });

  if (!competitions || competitions.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    return [];
  }

  return sortCompetitions(
    competitions.map(c => {
      return {
        ...omit(c, '_count', 'verificationHash'),
        group: c.group
          ? {
              ...omit(c.group, '_count', 'verificationHash'),
              memberCount: c.group._count.memberships
            }
          : undefined,
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
