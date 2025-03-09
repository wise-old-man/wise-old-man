import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import prisma from '../../prisma';
import { Job } from '../job.utils';

export class SyncApiKeysJob extends Job<unknown> {
  async execute() {
    const apiKeys = await prisma.apiKey.findMany();

    // Cache all these api keys in Redis, so that they can be quickly accessed on every API request
    for (const key of apiKeys) {
      await redisClient.set(buildCompoundRedisKey('api-key', key.id), String(key.master));
    }
  }
}
