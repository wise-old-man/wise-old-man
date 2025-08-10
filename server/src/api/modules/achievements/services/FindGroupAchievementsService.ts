import prisma from '../../../../prisma';
import { Achievement, Player } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';

async function findGroupAchievements(
  groupId: number,
  pagination: PaginationOptions
): Promise<Array<{ achievement: Achievement; player: Player }>> {
  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: groupId },
    include: { memberships: { select: { playerId: true } } }
  });

  if (!groupAndMemberships) {
    throw new NotFoundError('Group not found.');
  }

  // Convert the memberships to an array of player IDs
  const playerIds = groupAndMemberships.memberships.map(m => m.playerId);

  if (playerIds.length === 0) {
    return [];
  }

  // Fetch all achievements for these player IDs
  const achievements = await prisma.achievement.findMany({
    where: { playerId: { in: playerIds } },
    include: { player: true },
    orderBy: [{ createdAt: 'desc' }],
    take: pagination.limit,
    skip: pagination.offset
  });

  return achievements.map(({ player, ...achievement }) => ({ achievement, player }));
}

export { findGroupAchievements };
