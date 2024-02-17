import prisma, { Player } from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import logger from '../../../util/logging';
import { setCachedPlayerId, standardize } from '../player.utils';

async function deletePlayer(username: string): Promise<Player> {
  try {
    const deletedPlayer = await prisma.player.delete({
      where: { username: standardize(username) }
    });

    // Clear this player's ID cache
    await setCachedPlayerId(deletedPlayer.username, null);

    logger.moderation(`[Player:${deletedPlayer.username}] Deleted`);

    return deletedPlayer;
  } catch (error) {
    // Failed to find player with that username or id
    throw new NotFoundError('Player not found.');
  }
}

export { deletePlayer };
