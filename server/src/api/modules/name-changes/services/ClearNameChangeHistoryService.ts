import prisma from '../../../../prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { standardize } from '../../players/player.utils';

async function clearNameChangeHistory(username: string): Promise<{ count: number }> {
  const { count } = await prisma.nameChange.deleteMany({
    where: {
      player: {
        username: standardize(username)
      }
    }
  });

  if (count > 0) {
    return { count };
  }

  const player = await prisma.player.findFirst({
    where: { username: standardize(username) }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  throw new BadRequestError('No name changes were found for this player.');
}

export { clearNameChangeHistory };
