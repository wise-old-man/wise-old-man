import prisma from '../../prisma';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { JobHandler } from '../types/job-handler.type';

const API_KEY_CACHE_TTL_SECONDS = 24 * 60 * 60;

export const SyncApiKeysJobHandler: JobHandler = {
  async execute() {
    const apiKeys = await prisma.apiKey.findMany();

    if (apiKeys.length === 0) {
      return;
    }

    // Cache all active api keys in Redis, so that they can be quickly accessed on every API request
    const pipeline = redisClient.pipeline();

    for (const key of apiKeys) {
      const redisKey = buildCompoundRedisKey('api_key', key.id);

      if (key.active) {
        pipeline.set(redisKey, String(key.master), 'EX', API_KEY_CACHE_TTL_SECONDS);
      } else {
        pipeline.del(redisKey);
      }
    }

    await pipeline.exec();
  }
};
