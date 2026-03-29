import IORedis, { RedisOptions } from 'ioredis';

export const REDIS_CONFIG: RedisOptions = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  password: process.env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: false
};

export const redisClient = new IORedis({
  ...REDIS_CONFIG,
  keyPrefix: 'league'
});

export const bypassedRedisClient = new IORedis({
  ...REDIS_CONFIG
});

export function buildCompoundRedisKey(...keys: string[]) {
  return keys.join(':');
}
