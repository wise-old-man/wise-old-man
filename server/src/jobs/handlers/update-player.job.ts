import { isComplete } from '@attio/fetchable';
import { updatePlayer } from '../../api/modules/players/services/UpdatePlayerService';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { assertNever } from '../../utils/assert-never.util';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
}

export class UpdatePlayerJob extends Job<Payload> {
  static options: JobOptions = {
    backoff: 30_000,
    maxConcurrent: 4,
    rateLimiter: { max: 1, duration: 250 }
  };

  static getUniqueJobId(payload: Payload) {
    return payload.username;
  }

  async execute(payload: Payload): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    const updateResult = await updatePlayer(payload.username);

    if (isComplete(updateResult)) {
      return;
    }

    switch (updateResult.error.code) {
      case 'PLAYER_IS_RATE_LIMITED':
        return;
      case 'PLAYER_OPTED_OUT':
      case 'PLAYER_IS_FLAGGED':
      case 'PLAYER_IS_BLOCKED':
      case 'PLAYER_IS_ARCHIVED':
      case 'USERNAME_VALIDATION_ERROR':
      case 'HISCORES_USERNAME_NOT_FOUND': {
        // This player doesn't need to be auto-updated anytime soon
        const cooldownKey = buildCompoundRedisKey('player-update-cooldown', payload.username);
        await redisClient.set(cooldownKey, 'true', 'PX', 86_400_000); // 24 hours
        break;
      }
      case 'HISCORES_UNEXPECTED_ERROR':
      case 'HISCORES_SERVICE_UNAVAILABLE': {
        // These can be retried later
        throw updateResult.error;
      }
      default:
        assertNever(updateResult.error);
    }
  }
}
