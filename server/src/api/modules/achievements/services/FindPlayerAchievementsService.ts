import { z } from 'zod';
import prisma, { modifyAchievements } from '../../../../prisma';
import { ExtendedAchievement } from '../achievement.types';
import { extend } from '../achievement.utils';

const schema = z.object({
  playerId: z.number().int().positive()
});

type FindPlayerAchievementsParams = z.infer<typeof schema>;
type FindPlayerAchievementsResult = ExtendedAchievement[];

class FindPlayerAchievementsService {
  validate(payload: any): FindPlayerAchievementsParams {
    return schema.parse(payload);
  }

  async execute(params: FindPlayerAchievementsParams): Promise<FindPlayerAchievementsResult> {
    // Query the database for all achievements of "playerId"
    const achievements = await prisma.achievement
      .findMany({ where: { playerId: params.playerId } })
      .then(modifyAchievements);

    // Extend this database model to include the "measure" field
    return achievements.map(extend);
  }
}

export default new FindPlayerAchievementsService();
