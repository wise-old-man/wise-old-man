import prisma from '../../../../prisma';
import { PlayerAnnotation, PlayerAnnotationType } from '../../../../types';
import { ConflictRequestError, NotFoundError } from '../../../errors';
import { standardize } from '../player.utils';

async function createPlayerAnnotation(
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

  if (player.annotations.some(a => a.type === annotationType)) {
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
