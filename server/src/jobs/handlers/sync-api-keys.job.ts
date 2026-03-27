import prisma from '../../prisma';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { JobHandler } from '../types/job-handler.type';

export const SyncApiKeysJobHandler: JobHandler = {
  async execute() {
    const apiKeys = await prisma.apiKey.findMany();

    if (apiKeys.length === 0) {
      return;
    }

    // Cache all these api keys in Redis, so that they can be quickly accessed on every API request
    const apiKeyEntries = apiKeys.flatMap(key => [
      buildCompoundRedisKey('api_key', key.id),
      String(key.master)
    ]);

    await redisClient.mset(apiKeyEntries);
  }
};
