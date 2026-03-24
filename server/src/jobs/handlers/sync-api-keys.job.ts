import prisma from '../../prisma';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { JobHandler } from '../types/job-handler.type';

export const SyncApiKeysJobHandler: JobHandler = {
  async execute() {
    const apiKeys = await prisma.apiKey.findMany();

    // Cache all these api keys in Redis, so that they can be quickly accessed on every API request
    for (const key of apiKeys) {
      await redisClient.set(buildCompoundRedisKey('api-key', key.id), String(key.master));

      // Also write to this key, so that we can slowly migrate to a new naming convention
      // In the future, we can remove the version above, and move all reads to this new version
      await redisClient.set(buildCompoundRedisKey('api_key', key.id), String(key.master));
    }
  }
};
