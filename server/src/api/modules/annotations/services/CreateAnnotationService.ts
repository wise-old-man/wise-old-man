import { NotFoundError, BadRequestError } from '../../../errors';
import prisma, { PlayerAnnotations, Annotation } from '../../../../prisma';
import { standardize } from '../../players/player.utils';

async function createPlayerAnnotation(username: string, annotation: PlayerAnnotations): Promise<Annotation> {
  const player = await prisma.player.findUnique({
    where: { username: standardize(username) }
  });

  if (!player) {
    throw new NotFoundError(`Player: ${username} not found`);
  }

  const playerAnnotation = await prisma.annotation.findFirst({
    where: {
      playerId: player?.id,
      type: annotation
    }
  });
  if (playerAnnotation) {
    throw new BadRequestError(`The annotation ${annotation} already exists for ${username}`);
  }

  return prisma.annotation.create({
    data: {
      playerId: player.id,
      type: annotation
    }
  });
}

export { createPlayerAnnotation };
