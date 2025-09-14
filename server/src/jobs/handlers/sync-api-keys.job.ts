import { eventEmitter, EventType } from '../../api/events';
import prisma from '../../prisma';
import prometheus from '../../services/prometheus.service';
import { buildCompoundRedisKey, redisClient } from '../../services/redis.service';
import { Metric } from '../../types';
import { Job } from '../job.class';

export class SyncApiKeysJob extends Job<unknown> {
  async execute() {
    /**
     * Doing this here just as a test
     */
    eventEmitter.emit(EventType.PLAYER_ACHIEVEMENTS_CREATED, {
      username: 'psikoi ii',
      achievements: [{ metric: Metric.ZULRAH, threshold: 500 }]
    });
    prometheus.trackGenericMetric('test-emit');

    const apiKeys = await prisma.apiKey.findMany();

    // Cache all these api keys in Redis, so that they can be quickly accessed on every API request
    for (const key of apiKeys) {
      await redisClient.set(buildCompoundRedisKey('api-key', key.id), String(key.master));

      // Also write to this key, so that we can slowly migrate to a new naming convention
      // In the future, we can remove the version above, and move all reads to this new version
      await redisClient.set(buildCompoundRedisKey('api_key', key.id), String(key.master));
    }
  }
}
