import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Achievement, PlayerAnnotationType } from '../../../../types';
import { standardizeUsername } from '../../players/player.utils';

export async function findPlayerAchievements(
  username: string
): AsyncResult<Achievement[], { code: 'PLAYER_NOT_FOUND' } | { code: 'PLAYER_OPTED_OUT' }> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: {
      achievements: true,
      annotations: true
    }
  });

  if (player === null) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    return errored({ code: 'PLAYER_OPTED_OUT' });
  }

  return complete(player.achievements);
}
