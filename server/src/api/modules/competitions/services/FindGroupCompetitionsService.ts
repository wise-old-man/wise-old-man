import { omit } from 'lodash';
import { z } from 'zod';
import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { CompetitionWithCount } from '../competition.types';

const inputSchema = z
  .object({
    groupId: z.number().positive()
  })
  .merge(PAGINATION_SCHEMA);

type FindGroupCompetitionsParams = z.infer<typeof inputSchema>;

async function findGroupCompetitions(payload: FindGroupCompetitionsParams): Promise<CompetitionWithCount[]> {
  const params = inputSchema.parse(payload);

  const competitions = await prisma.competition.findMany({
    where: { groupId: params.groupId },
    include: {
      _count: {
        select: {
          participations: true
        }
      }
    },
    orderBy: [{ id: 'desc' }],
    take: params.limit,
    skip: params.offset
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
      ...omit(g, ['_count', 'verificationHash']),
      participantCount: g._count.participations
    };
  });
}

export { findGroupCompetitions };
