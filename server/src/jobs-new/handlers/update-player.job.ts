import { BadRequestError, RateLimitError, ServerError } from '../../api/errors';
import { standardize } from '../../api/modules/players/player.utils';
import { updatePlayer } from '../../api/modules/players/services/UpdatePlayerService';
import prometheusService from '../../api/services/external/prometheus.service';
import prisma from '../../prisma';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { Period, PeriodProps, PlayerStatus, PlayerType } from '../../utils';
import type { JobManager } from '../job-manager';
import { Job } from '../job.class';

interface Payload {
  username: string;
  source:
    | 'update-all-members'
    | 'update-all-participants'
    | 'on-participants-joined'
    | 'on-members-joined'
    | 'on-player-name-changed'
    | 'on-competition-ending-2h'
    | 'on-competition-ending-12h'
    | 'schedule-patron-group-updates'
    | 'schedule-patron-player-updates';
}

export class UpdatePlayerJob extends Job<Payload> {
  constructor(jobManager: JobManager) {
    super(jobManager);

    this.options = {
      backoff: 30_000,
      maxConcurrent: 4,
      rateLimiter: { max: 1, duration: 250 }
    };
  }

  async execute(payload: Payload): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    prometheusService.trackUpdatePlayerJobSource(payload.source);

    try {
      await updatePlayer(payload.username);
    } catch (error) {
      if (await shouldRetry(payload.username, error)) {
        throw error;
      }
    }
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
      await redisClient.set(
        buildCompoundRedisKey('player-update-cooldown', player.username),
        'true',
        'PX',
        PeriodProps[Period.DAY].milliseconds
      );

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
