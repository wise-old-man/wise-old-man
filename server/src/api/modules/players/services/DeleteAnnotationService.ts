import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { PlayerAnnotation, PlayerAnnotationType } from '../../../../types';
import { standardizeUsername } from '../player.utils';

export async function deletePlayerAnnotation(
  username: string,
  annotationType: PlayerAnnotationType
): AsyncResult<PlayerAnnotation, { code: 'PLAYER_NOT_FOUND' } | { code: 'PLAYER_ANNOTATION_NOT_FOUND' }> {
  const player = await prisma.player.findUnique({
    where: { username: standardizeUsername(username) },
    include: { annotations: true }
  });

  if (player === null) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  const existingAnnotation = player.annotations.find(a => a.type === annotationType);

  if (existingAnnotation === undefined) {
    return errored({ code: 'PLAYER_ANNOTATION_NOT_FOUND' });
  }

  const result = await prisma.playerAnnotation.delete({
    where: {
      playerId_type: {
        playerId: player.id,
        type: annotationType
      }
    }
  });

  return complete(result);
}
