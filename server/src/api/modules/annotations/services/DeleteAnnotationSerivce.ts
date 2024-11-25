import { NotFoundError } from '../../../errors';
import prisma, { PlayerAnnotations, Annotation } from '../../../../prisma';
import { standardize } from '../../players/player.utils';

async function deletePlayerAnnotation(username: string, annotation: PlayerAnnotations): Promise<Annotation> {
  const player = await prisma.player.findUnique({
    where: { username: standardize(username) },
    include: { annotations: true }
  });
  if (!player) {
    throw new NotFoundError(`Player: ${username} not found`);
  }
  const existingAnnotation = player.annotations.find(a => a.type === annotation);
  if (!existingAnnotation) {
    throw new NotFoundError(
      `${annotation} does not exist for ${username}, available annotations for this player are: ${player.annotations.length > 0 ? player.annotations.map(a => a.type).join(', ') : 'none'}`
    );
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
