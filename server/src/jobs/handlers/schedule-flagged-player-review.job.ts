import { standardize } from '../../api/modules/players/player.utils';
import { updatePlayer } from '../../api/modules/players/services/UpdatePlayerService';
import prisma from '../../prisma';
import { Player, PlayerStatus } from '../../types';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username?: string;
}

export const ScheduleFlaggedPlayerReviewJobHandler: JobHandler<Payload> = {
  async execute(payload) {
    const flaggedPlayer =
      payload.username === undefined
        ? await findRandomFlaggedPlayer()
        : await prisma.player.findFirst({ where: { username: standardize(payload.username) } });

    if (flaggedPlayer === null) {
      return;
    }

    // Force-unflag them
    await prisma.player.update({
      data: {
        status: PlayerStatus.ACTIVE
      },
      where: {
        id: flaggedPlayer.id
      }
    });

    // Update them, this will either fix their account if they're not flaggable anymore,
    // or send a review message to our Discord server.
    await updatePlayer(flaggedPlayer.username);
  }
};

async function findRandomFlaggedPlayer() {
  const results = await prisma.$queryRaw<Array<Pick<Player, 'id' | 'username'>>>`
      SELECT "id", "username" FROM public.players
      WHERE "status" = ${PlayerStatus.FLAGGED}::player_status
      ORDER BY RANDOM()
      LIMIT 1
    `;

  if (results.length === 0) {
    return null;
  }

  return results[0];
}
