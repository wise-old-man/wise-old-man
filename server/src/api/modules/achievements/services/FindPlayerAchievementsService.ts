import { z } from 'zod';
import prisma, { modifyAchievement } from '../../../../prisma';
import { ExtendedAchievement } from '../achievement.types';
import { extend } from '../achievement.utils';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type FindPlayerAchievementsParams = z.infer<typeof inputSchema>;

async function findPlayerAchievements(payload: FindPlayerAchievementsParams): Promise<ExtendedAchievement[]> {
  const params = inputSchema.parse(payload);

  // Query the database for all achievements of "playerId"
  const achievements = await prisma.achievement
    .findMany({ where: { playerId: params.id } })
    .then(a => a.map(modifyAchievement));

  // Extend this database model to include the "measure" field
  return achievements.map(extend);
}

export { findPlayerAchievements };
