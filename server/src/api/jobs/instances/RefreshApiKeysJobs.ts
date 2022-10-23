import prisma from '../../../prisma';
import redisService from '../../services/external/redis.service';
import { JobType, JobDefinition } from '../job.types';

class RefreshApiKeysJob implements JobDefinition<unknown> {
  type: JobType;

  constructor() {
    this.type = JobType.REFRESH_API_KEYS;
  }

  async execute() {
    const apiKeys = await prisma.apiKey.findMany();

    // Cache all these api keys in Redis, so that they can be quickly accessed on every API request
    await Promise.all(apiKeys.map(key => redisService.setValue('api-key', key.id, String(key.active))));
  }
}

export default new RefreshApiKeysJob();
