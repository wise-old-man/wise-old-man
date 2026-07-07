import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Achievement, Player } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

export async function findGroupAchievements(
  groupId: number,
  pagination: PaginationOptions
): AsyncResult<Array<{ achievement: Achievement; player: Player }>, { code: 'GROUP_NOT_FOUND' }> {
  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: groupId },
    include: { memberships: { select: { playerId: true } } }
  });

  if (groupAndMemberships === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  // Convert the memberships to an array of player IDs
  const playerIds = groupAndMemberships.memberships.map(m => m.playerId);

  if (playerIds.length === 0) {
    return complete([]);
  }

  // Fetch all achievements for these player IDs
  const achievements = await prisma.achievement.findMany({
    where: { playerId: { in: playerIds } },
    include: { player: true },
    orderBy: [{ createdAt: 'desc' }],
    take: pagination.limit,
    skip: pagination.offset
  });

  return complete(
    achievements.map(({ player, ...achievement }) => ({
      achievement,
      player
    }))
  );
}
