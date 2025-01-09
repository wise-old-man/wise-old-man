import { NotFoundError, ConflictRequestError } from '../../../errors';
import prisma, { PlayerAnnotationType, PlayerAnnotation } from '../../../../prisma';
import { standardize } from '../player.utils';

async function createPlayerAnnotation(
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

  if (player.playerAnnotations.some(a => a.type === annotationType)) {
    throw new ConflictRequestError(`The annotation ${annotationType} already exists for ${username}`);
  }

  return prisma.playerAnnotation.create({
    data: {
      playerId: player.id,
      type: annotationType
    }
  });
}

export { createPlayerAnnotation };
