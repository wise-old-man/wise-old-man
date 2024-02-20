import prisma from '../../../../prisma';
import { PaginationOptions } from '../../../util/validation';
import { NotFoundError } from '../../../errors';
import { ExtendedAchievementWithPlayer } from '../achievement.types';
import { extend } from '../achievement.utils';

async function findGroupAchievements(
  groupId: number,
  pagination: PaginationOptions
): Promise<ExtendedAchievementWithPlayer[]> {
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

  return achievements.map(a => {
    return { ...extend(a), player: a.player };
  });
}

export { findGroupAchievements };
