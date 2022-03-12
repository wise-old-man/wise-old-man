import { z } from 'zod';
import prisma, { modifyAchievements } from '../../../../prisma';
import { ExtendedAchievement } from '../achievement.types';
import { extend } from '../achievement.utils';

const paginationSchema = z.object({
  limit: z.number().int().positive().default(20),
  offset: z.number().int().positive().default(0)
});

const paramsSchema = z.object({
  groupId: z.number().int().positive(),
  pagination: paginationSchema.optional()
});

type FindGroupAchievementsParams = z.infer<typeof paramsSchema>;
type FindGroupAchievementsResult = ExtendedAchievement[];

class FindGroupAchievementsService {
  validate(payload: any): FindGroupAchievementsParams {
    return paramsSchema.parse(payload);
  }

  async execute(params: FindGroupAchievementsParams): Promise<FindGroupAchievementsResult> {
    // Fetch all memberships for this group
    const memberPlayerIds = await prisma.membership.findMany({
      where: { groupId: params.groupId },
      select: { playerId: true }
    });

    // Convert the memberships to an array of player IDs
    const playerIds = memberPlayerIds.map(m => m.playerId);

    if (playerIds.length === 0) {
      return [];
    }

    // Fetch all achievements for these player IDs
    const achievements = await prisma.achievement
      .findMany({
        where: { playerId: { in: playerIds } },
        include: { player: true },
        orderBy: [{ createdAt: 'desc' }],
        take: params.pagination.limit,
        skip: params.pagination.offset
      })
      .then(modifyAchievements);

    return achievements.map(extend);
  }
}

export default new FindGroupAchievementsService();
