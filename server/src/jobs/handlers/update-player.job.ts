import { isComplete } from '@attio/fetchable';
import { updatePlayer } from '../../api/modules/players/services/UpdatePlayerService';
import prometheusService from '../../api/services/external/prometheus.service';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { assertNever } from '../../utils/assert-never.util';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

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
  static options: JobOptions = {
    backoff: 30_000,
    maxConcurrent: 4,
    rateLimiter: { max: 1, duration: 250 }
  };

  async execute(payload: Payload): Promise<void> {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    prometheusService.trackUpdatePlayerJobSource(payload.source);

    const updateResult = await updatePlayer(payload.username);

    if (isComplete(updateResult)) {
      return;
    }

    switch (updateResult.error.code) {
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
      case 'PLAYER_IS_RATE_LIMITED':
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
