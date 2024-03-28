import { updatePlayer } from '../../api/modules/players/services/UpdatePlayerService';
import prisma from '../../prisma';
import { PlayerStatus } from '../../utils';
import { Job } from '../job.utils';

export class ScheduleFlaggedPlayerReviewJob extends Job<unknown> {
  async execute() {
    // Find a flagged player
    const flaggedPlayer = await prisma.player.findFirst({
      where: { status: PlayerStatus.FLAGGED },
      orderBy: { updatedAt: 'desc' }
    });

    if (!flaggedPlayer) {
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
}
