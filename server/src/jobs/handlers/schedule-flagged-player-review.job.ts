import { updatePlayer } from '../../api/modules/players/services/UpdatePlayerService';
import prisma from '../../prisma';
import { Player, PlayerStatus } from '../../types';
import { Job } from '../job.class';

export class ScheduleFlaggedPlayerReviewJob extends Job<unknown> {
  async execute() {
    // Find a flagged player
    const results = await prisma.$queryRaw<Array<Pick<Player, 'id' | 'username'>>>`
      SELECT "id", "username" FROM public.players
      WHERE "status" = '${PlayerStatus.FLAGGED}'
      ORDER BY RANDOM()
      LIMIT 1
    `;

    if (results.length === 0) {
      return;
    }

    const [flaggedPlayer] = results;

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
}
