import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { PlayerAnnotation, PlayerAnnotationType } from '../../../../types';
import { standardizeUsername } from '../player.utils';

export async function createPlayerAnnotation(
  username: string,
  annotationType: PlayerAnnotationType
): AsyncResult<PlayerAnnotation, { code: 'PLAYER_NOT_FOUND' } | { code: 'DUPLICATE_PLAYER_ANNOTATION' }> {
  const player = await prisma.player.findUnique({
    where: { username: standardizeUsername(username) },
    include: { annotations: true }
  });

  if (player === null) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  if (player.annotations.some(a => a.type === annotationType)) {
    return errored({ code: 'DUPLICATE_PLAYER_ANNOTATION' });
  }

  // If it's an opt out, we remove the profile from any groups and competitions.
  if (annotationType === PlayerAnnotationType.OPT_OUT) {
    const [annotation] = await prisma.$transaction([
      prisma.playerAnnotation.create({
        data: {
          playerId: player.id,
          type: annotationType
        }
      }),
      prisma.membership.deleteMany({
        where: { playerId: player.id }
      }),
      prisma.participation.deleteMany({
        where: { playerId: player.id, competition: { endsAt: { gte: new Date() } } }
      })
    ]);

    return complete(annotation);
  }

  const result = await prisma.playerAnnotation.create({
    data: {
      playerId: player.id,
      type: annotationType
    }
  });

  return complete(result);
}
