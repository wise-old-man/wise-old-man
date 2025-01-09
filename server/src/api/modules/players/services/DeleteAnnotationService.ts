import { NotFoundError } from '../../../errors';
import prisma, { PlayerAnnotationType, PlayerAnnotation } from '../../../../prisma';
import { standardize } from '../player.utils';

async function deletePlayerAnnotation(
  username: string,
  annotationType: PlayerAnnotationType
): Promise<PlayerAnnotation> {
  const player = await prisma.player.findUnique({
    where: { username: standardize(username) },
    include: { playerAnnotations: true }
  });

  if (!player) {
    throw new NotFoundError(`Player: ${username} not found`);
  }

  const existingAnnotation = player.playerAnnotations.find(a => a.type === annotationType);

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
