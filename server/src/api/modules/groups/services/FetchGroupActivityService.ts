import prisma from '../../../../prisma';
import { MemberActivity, Player } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';

async function fetchGroupActivity(
  groupId: number,
  pagination: PaginationOptions
): Promise<Array<{ activity: MemberActivity; player: Player }>> {
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

  return activities.map(({ player, ...activity }) => ({ activity, player }));
}

export { fetchGroupActivity };
