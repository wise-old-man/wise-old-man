import { PaginationOptions } from '../../../util/validation';
import { MemberActivityWithPlayer } from '../group.types';
import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';

async function fetchGroupActivity(
  groupId: number,
  pagination: PaginationOptions
): Promise<MemberActivityWithPlayer[]> {
  const activities = await prisma.memberActivity.findMany({
    where: { groupId },
    include: {
      player: true
    },
    orderBy: { createdAt: 'desc' },
    take: pagination.limit,
    skip: pagination.offset
  });

  if (!activities || activities.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }
    return [];
  }

  return activities;
}

export { fetchGroupActivity };
