import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';
import { ExtendedAchievement } from '../achievement.types';
import { extend } from '../achievement.utils';

async function findPlayerAchievements(username: string): Promise<ExtendedAchievement[]> {
  // Query the database for all achievements of "playerId"
  const achievements = await prisma.achievement.findMany({
    where: {
      player: {
        username: standardize(username)
      }
    }
  });

  // Extend this database model to include the "measure" field
  const extendedAchievements = achievements.map(extend);

  if (extendedAchievements.length === 0) {
    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return extendedAchievements;
}

export { findPlayerAchievements };
