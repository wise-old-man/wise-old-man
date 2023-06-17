import { z } from 'zod';
import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
import { NotFoundError } from '../../../errors';
// import { PAGINATION_SCHEMA } from '../../../util/validation'; // disable pagination for now
import { CompetitionListItem } from '../competition.types';

const inputSchema = z.object({
  groupId: z.number().positive()
});
// .merge(PAGINATION_SCHEMA); // disable pagination for now

type FindGroupCompetitionsParams = z.infer<typeof inputSchema>;

async function findGroupCompetitions(payload: FindGroupCompetitionsParams): Promise<CompetitionListItem[]> {
  const params = inputSchema.parse(payload);

  const competitions = await prisma.competition.findMany({
    where: { groupId: params.groupId },
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
    },
    orderBy: [{ id: 'desc' }]
    // take: params.limit, // disable pagination for now
    // skip: params.offset // disable pagination for now
  });

  if (!competitions || competitions.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: params.groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    return [];
  }

  return competitions.map(g => {
    return {
      ...omit(g, '_count', 'verificationHash'),
      group: g.group
        ? {
            ...omit(g.group, '_count', 'verificationHash'),
            memberCount: g.group._count.memberships
          }
        : undefined,
      participantCount: g._count.participations
    };
  });
}

export { findGroupCompetitions };
