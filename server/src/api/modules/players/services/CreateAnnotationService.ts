import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { PlayerAnnotation, PlayerAnnotationType } from '../../../../types';
import { standardizeUsername } from '../player.utils';

export async function createPlayerAnnotation(
  username: string,
  annotationType: PlayerAnnotationType
): AsyncResult<PlayerAnnotation, { code: 'PLAYER_NOT_FOUND' } | { code: 'DUPLICATE_PALYER_ANNOTATION' }> {
  const player = await prisma.player.findUnique({
    where: { username: standardizeUsername(username) },
    include: { annotations: true }
  });

  if (player === null) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  if (player.annotations.some(a => a.type === annotationType)) {
    return errored({ code: 'DUPLICATE_PALYER_ANNOTATION' });
  }

  const result = await prisma.playerAnnotation.create({
    data: {
      playerId: player.id,
      type: annotationType
    }
  });

  return complete(result);
}
