import IORedis from 'ioredis';
import redisConfig from '../config/redis.config';

export const redisClient = new IORedis(redisConfig);

export function buildCompoundRedisKey(...keys: string[]) {
  return keys.join(':');
}
