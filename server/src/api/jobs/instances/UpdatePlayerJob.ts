import prisma from '../../../prisma';
import { PlayerStatus, PlayerType } from '../../../utils';
import redisService from '../../services/external/redis.service';
import * as playerServices from '../../modules/players/player.services';
import { standardize } from '../../modules/players/player.utils';
import { RateLimitError, ServerError, BadRequestError } from '../../errors';
import { JobType, JobDefinition, JobOptions } from '../job.types';

export interface UpdatePlayerJobPayload {
  username: string;
}

class UpdatePlayerJob implements JobDefinition<UpdatePlayerJobPayload> {
  type: JobType;
  options: JobOptions;

  constructor() {
    this.type = JobType.UPDATE_PLAYER;

    this.options = {
      rateLimiter: { max: 1, duration: 500 },
      defaultOptions: { attempts: 3, backoff: 30_000 }
    };
  }

  async execute(data: UpdatePlayerJobPayload) {
    if (!data.username) return;

    await playerServices.updatePlayer({ username: data.username }).catch(async error => {
      if (await shouldRetry(data.username, error)) {
        throw error;
      }
    });
  }

  onFailedAllAttempts(data: UpdatePlayerJobPayload) {
    redisService.deleteKey(`cd:UpdatePlayer:${data.username}`);
  }

  onSuccess(data: UpdatePlayerJobPayload) {
    redisService.deleteKey(`cd:UpdatePlayer:${data.username}`);
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

export default new UpdatePlayerJob();
