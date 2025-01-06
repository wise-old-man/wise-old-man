import { NotFoundError, ConflictRequestError } from '../../../errors';
import prisma, { PlayerAnnotationType, Annotation } from '../../../../prisma';
import { standardize } from '../player.utils';

async function createPlayerAnnotation(
  username: string,
  annotation: PlayerAnnotationType
): Promise<Annotation> {
  const player = await prisma.player.findUnique({
    where: { username: standardize(username) },
    include: { annotations: true }
  });

  if (!player) {
    throw new NotFoundError(`Player: ${username} not found`);
  }

  if (player.annotations.some(a => a.type === annotation)) {
    throw new ConflictRequestError(`The annotation ${annotation} already exists for ${username}`);
  }

  return prisma.annotation.create({
    data: {
      playerId: player.id,
      type: annotation
    }
  });
}

export { createPlayerAnnotation };
