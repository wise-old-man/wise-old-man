import { NotFoundError, ConflictRequestError } from '../../../errors';
import prisma, { PlayerAnnotationType, PlayerAnnotation } from '../../../../prisma';
import { standardize } from '../player.utils';

async function createPlayerAnnotation(
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

  if (player.playerAnnotations.some(a => a.type === annotation)) {
    throw new ConflictRequestError(`The annotation ${annotation} already exists for ${username}`);
  }

  return prisma.playerAnnotation.create({
    data: {
      playerId: player.id,
      type: annotation
    }
  });
}

export { createPlayerAnnotation };
