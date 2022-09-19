import redisService from '../../services/external/redis.service';
import * as playerServices from '../../modules/players/player.services';
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
      rateLimiter: { max: 1, duration: 2000 },
      defaultOptions: { attempts: 3, backoff: 30_000 }
    };
  }

  async execute(data: UpdatePlayerJobPayload) {
    if (!data.username) return;

    await playerServices.updatePlayer({ username: data.username });
  }

  onFailure(data: UpdatePlayerJobPayload) {
    redisService.deleteKey(`cd:UpdatePlayer:${data.username}`);
  }

  onSuccess(data: UpdatePlayerJobPayload) {
    redisService.deleteKey(`cd:UpdatePlayer:${data.username}`);
  }
}

export default new UpdatePlayerJob();
