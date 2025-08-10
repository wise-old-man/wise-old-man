import prisma from '../../../../prisma';
import { Achievement } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';

async function findPlayerAchievements(username: string): Promise<Achievement[]> {
  const achievements = await prisma.achievement.findMany({
    where: {
      player: {
        username: standardize(username)
      }
    }
  });

  if (achievements.length === 0) {
    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return achievements;
}

export { findPlayerAchievements };
