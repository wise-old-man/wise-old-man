import { z } from 'zod';
import prisma from '../../../../prisma';
import { PAGINATION_SCHEMA } from '../../../util/validation';
import { NotFoundError } from '../../../errors';
import { ExtendedAchievementWithPlayer } from '../achievement.types';
import { extend } from '../achievement.utils';

const inputSchema = z
  .object({
    id: z.number().int().positive()
  })
  .merge(PAGINATION_SCHEMA);

type FindGroupAchievementsParams = z.infer<typeof inputSchema>;

async function findGroupAchievements(
  payload: FindGroupAchievementsParams
): Promise<ExtendedAchievementWithPlayer[]> {
  const params = inputSchema.parse(payload);

  // Fetch this group and all of its memberships
  const groupAndMemberships = await prisma.group.findFirst({
    where: { id: params.id },
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
    take: params.limit,
    skip: params.offset
  });

  return achievements.map(a => {
    return { ...extend(a), player: a.player };
  });
}

export { findGroupAchievements };
