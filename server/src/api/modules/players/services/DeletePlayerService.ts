import { z } from 'zod';
import prisma, { modifyPlayer, Player } from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import logger from '../../../util/logging';
import { setCachedPlayerId, standardize } from '../player.utils';

const inputSchema = z
  .object({
    id: z.number().positive().optional(),
    username: z.string().optional()
  })
  .refine(s => s.id || s.username, {
    message: 'Undefined id and username.'
  });

type DeletePlayerParams = z.infer<typeof inputSchema>;

async function deletePlayer(payload: DeletePlayerParams): Promise<Player> {
  const params = inputSchema.parse(payload);

  try {
    const deletedPlayer = await prisma.player
      .delete({
        where: { id: params.id, username: standardize(params.username) }
      })
      .then(modifyPlayer);

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
