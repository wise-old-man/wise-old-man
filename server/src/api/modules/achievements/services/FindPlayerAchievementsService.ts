import prisma from '../../../../prisma';
import { Achievement, PlayerAnnotationType } from '../../../../types';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { standardizeUsername } from '../../players/player.utils';

export async function findPlayerAchievements(username: string): Promise<Achievement[]> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: {
      achievements: true,
      annotations: true
    }
  });

  // TODO: Refactor error handlign
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player has opted out.');
  }

  return player.achievements;
}
