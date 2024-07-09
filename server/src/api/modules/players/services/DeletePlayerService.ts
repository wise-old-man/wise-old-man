import prisma, { Player } from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { standardize } from '../player.utils';

async function deletePlayer(username: string): Promise<Player> {
  try {
    const deletedPlayer = await prisma.player.delete({
      where: { username: standardize(username) }
    });

    return deletedPlayer;
  } catch (error) {
    // Failed to find player with that username or id
    throw new NotFoundError('Player not found.');
  }
}

export { deletePlayer };
