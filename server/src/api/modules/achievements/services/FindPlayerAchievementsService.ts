import prisma from '../../../../prisma';
import { Achievement, PlayerAnnotationType } from '../../../../types';
import { NotFoundError, ForbiddenError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

async function findPlayerAchievements(username: string): Promise<Achievement[]> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: { annotations: true }
  });

  // TODO: refactor error handling
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player has opted out.');
  }

  const achievements = await prisma.achievement.findMany({
    where: {
      playerId: player.id
    }
  });

  return achievements;
}

export { findPlayerAchievements };
