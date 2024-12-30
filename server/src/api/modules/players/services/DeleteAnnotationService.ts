import { NotFoundError } from '../../../errors';
import prisma, { PlayerAnnotationType, playerAnnotations } from '../../../../prisma';
import { standardize } from '../player.utils';

async function deletePlayerAnnotation(
  username: string,
  annotation: PlayerAnnotationType
): Promise<playerAnnotations> {
  const player = await prisma.player.findUnique({
    where: { username: standardize(username) },
    include: { annotations: true }
  });

  if (!player) {
    throw new NotFoundError(`Player: ${username} not found`);
  }

  const existingAnnotation = player.annotations.find(a => a.type === annotation);

  if (!existingAnnotation) {
    throw new NotFoundError(`${annotation} does not exist for ${username}.`);
  }

  return prisma.annotation.delete({
    where: {
      playerId_type: {
        playerId: player.id,
        type: annotation
      }
    }
  });
}

export { deletePlayerAnnotation };
