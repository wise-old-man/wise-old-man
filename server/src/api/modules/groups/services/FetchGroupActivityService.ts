import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { MemberActivity, Player } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

export async function fetchGroupActivity(
  groupId: number,
  pagination: PaginationOptions
): AsyncResult<
  Array<{
    activity: MemberActivity;
    player: Player;
  }>,
  { code: 'GROUP_NOT_FOUND' }
> {
  const activities = await prisma.memberActivity.findMany({
    where: {
      groupId
    },
    include: {
      player: true
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: pagination.limit,
    skip: pagination.offset
  });

  if (activities.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (group === null) {
      return errored({ code: 'GROUP_NOT_FOUND' });
    }
  }

  return complete(
    activities.map(({ player, ...activity }) => ({
      activity,
      player
    }))
  );
}
