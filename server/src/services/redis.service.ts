import IORedis from 'ioredis';

export const REDIS_CONFIG = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

export const redisClient = new IORedis(REDIS_CONFIG);

export function buildCompoundRedisKey(...keys: string[]) {
  return keys.join(':');
}
