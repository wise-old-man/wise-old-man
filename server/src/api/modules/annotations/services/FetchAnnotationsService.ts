import { NotFoundError, BadRequestError } from '../../../errors';
import prisma, { PlayerAnnotations, Annotation } from '../../../../prisma';
import { standardize } from '../../players/player.utils';

async function fetchPlayerAnnotations(username: string): Promise<Annotation[]> {
  const player = await prisma.player.findUnique({
    where: { username: standardize(username) }
  });

  if (!player) {
    throw new NotFoundError(`Player: ${username} not found`);
  }

  return prisma.annotation.findMany({
    where: {
      playerId: player.id
    }
  });
}

export { fetchPlayerAnnotations };
