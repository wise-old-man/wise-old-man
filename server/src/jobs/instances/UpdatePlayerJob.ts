import { BadRequestError, RateLimitError, ServerError } from '../../api/errors';
import { standardize } from '../../api/modules/players/player.utils';
import { updatePlayer } from '../../api/modules/players/services/UpdatePlayerService';
import prisma from '../../prisma';
import { PlayerStatus, PlayerType } from '../../utils';
import { Job } from '../job.utils';
import type { JobManager } from '../job.manager';

type UpdatePlayerJobPayload = {
  username: string;
};

export class UpdatePlayerJob extends Job<UpdatePlayerJobPayload> {
  constructor(jobManager: JobManager) {
    super(jobManager);

    this.options = {
      attempts: 3,
      backoff: 30_000,
      rateLimiter: { max: 1, duration: 5000 }
    };
  }

  async execute(payload: UpdatePlayerJobPayload) {
    await updatePlayer(payload.username).catch(async error => {
      if (await shouldRetry(payload.username, error)) {
        throw error;
      }
    });
  }
}

/**
 * Some of the reasons a player update might fail aren't necessarily
 * a network/hiscores issue, so we should be selective about when
 * we retry a job to avoid wasting resources.
 */
async function shouldRetry(username: string, error: Error) {
  if (error instanceof RateLimitError) {
    return false;
  }

  if (error instanceof BadRequestError) {
    // Invalid username, no point in retrying this job
    if (error.message.includes('Validation error')) {
      return false;
    }

    // Archived player, no point in retrying this job
    if (error.message.includes('Player is archived')) {
      return false;
    }

    const player = await prisma.player.findFirst({
      where: {
        username: standardize(username)
      }
    });

    if (!player) {
      return true;
    }

    if (
      player.type === PlayerType.UNKNOWN ||
      player.status === PlayerStatus.UNRANKED ||
      player.status === PlayerStatus.BANNED
    ) {
      // This player likely doesn't exist on the hiscores, we can save on resources by not auto-retrying
      return false;
    }
  } else if (error instanceof ServerError) {
    if (error.message.includes('Player is flagged.')) {
      return false;
    }

    if (error.message.includes('The OSRS Hiscores were updated.')) {
      return false;
    }
  }

  return true;
}
