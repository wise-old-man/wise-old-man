import { isComplete } from '@attio/fetchable';
import { updatePlayer } from '../../api/modules/players/services/UpdatePlayerService';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { assertNever } from '../../utils/assert-never.util';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
}

export const UpdatePlayerJobHandler: JobHandler<Payload> = {
  options: {
    backoff: 30_000,
    maxConcurrent: 8,
    rateLimiter: { max: 1, duration: 250 }
  },

  generateUniqueJobId(payload) {
    return payload.username;
  },

  async execute(payload) {
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
      case 'INVALID_USERNAME':
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
};
