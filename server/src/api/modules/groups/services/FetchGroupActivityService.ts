import { z } from 'zod';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { MemberActivityWithPlayer } from '../group.types';
import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';

const inputSchema = z
  .object({
    groupId: z.number().positive()
  })
  .merge(PAGINATION_SCHEMA);

type FetchGroupActivityParams = z.infer<typeof inputSchema>;

async function fetchGroupActivity(payload: FetchGroupActivityParams): Promise<MemberActivityWithPlayer[]> {
  const params = inputSchema.parse(payload);

  const activities = await prisma.memberActivity.findMany({
    where: { groupId: params.groupId },
    include: {
      player: true
    },
    orderBy: { createdAt: 'desc' },
    take: params.limit,
    skip: params.offset
  });

  if (!activities || activities.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: params.groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found');
    }
    return [];
  }

  return activities;
}

export { fetchGroupActivity };
