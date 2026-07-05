import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Achievement } from '../../../../types';
import { standardizeUsername } from '../../players/player.utils';

export async function findPlayerAchievements(
  username: string
): AsyncResult<Achievement[], { code: 'PLAYER_NOT_FOUND' }> {
  const achievements = await prisma.achievement.findMany({
    where: {
      player: {
        username: standardizeUsername(username)
      }
    }
  });

  if (achievements.length === 0) {
    const player = await prisma.player.findFirst({
      where: { username: standardizeUsername(username) }
    });

    if (player === null) {
      return errored({ code: 'PLAYER_NOT_FOUND' });
    }
  }

  return complete(achievements);
}
