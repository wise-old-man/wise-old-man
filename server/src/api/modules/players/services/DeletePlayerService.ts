import prisma, { PrismaTypes } from '../../../../prisma';
import { Player } from '../../../../types';
import { NotFoundError, ServerError } from '../../../errors';
import { standardize } from '../player.utils';

async function deletePlayer(username: string): Promise<Player> {
  try {
    const deletedPlayer = await prisma.player.delete({
      where: { username: standardize(username) }
    });

    return deletedPlayer;
  } catch (error) {
    if (error instanceof PrismaTypes.PrismaClientKnownRequestError && error.code === 'P2025') {
      // Failed to find player with that username
      throw new NotFoundError('Player not found.');
    }

    throw new ServerError('Failed to delete player.');
  }
}

export { deletePlayer };
