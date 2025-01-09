import { NotFoundError } from '../../../errors';
import prisma, { PlayerAnnotationType, PlayerAnnotation } from '../../../../prisma';
import { standardize } from '../player.utils';

async function deletePlayerAnnotation(
  username: string,
  annotation: PlayerAnnotationType
): Promise<PlayerAnnotation> {
  const player = await prisma.player.findUnique({
    where: { username: standardize(username) },
    include: { playerAnnotations: true }
  });

  if (!player) {
    throw new NotFoundError(`Player: ${username} not found`);
  }

  const existingAnnotation = player.playerAnnotations.find(a => a.type === annotation);

  if (!existingAnnotation) {
    throw new NotFoundError(`${annotation} does not exist for ${username}.`);
  }

  return prisma.playerAnnotation.delete({
    where: {
      playerId_type: {
        playerId: player.id,
        type: annotation
      }
    }
  });
}

export { deletePlayerAnnotation };
