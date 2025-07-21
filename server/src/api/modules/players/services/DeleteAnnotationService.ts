import prisma from '../../../../prisma';
import { PlayerAnnotation, PlayerAnnotationType } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardize } from '../player.utils';

async function deletePlayerAnnotation(
  username: string,
  annotationType: PlayerAnnotationType
): Promise<PlayerAnnotation> {
  const player = await prisma.player.findUnique({
    where: { username: standardize(username) },
    include: { annotations: true }
  });

  if (!player) {
    throw new NotFoundError(`Player: ${username} not found`);
  }

  const existingAnnotation = player.annotations.find(a => a.type === annotationType);

  if (!existingAnnotation) {
    throw new NotFoundError(`${annotationType} does not exist for ${username}.`);
  }

  return prisma.playerAnnotation.delete({
    where: {
      playerId_type: {
        playerId: player.id,
        type: annotationType
      }
    }
  });
}

export { deletePlayerAnnotation };
