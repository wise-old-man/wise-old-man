import IORedis, { ValueType } from 'ioredis';
import redisConfig from '../../jobs/config/redis';

class RedisService {
  redisClient: IORedis.Redis;

  constructor() {
    this.redisClient = new IORedis(redisConfig);
  }

  getValue(baseKey: string, paramKey: string) {
    return this.redisClient.get(`${baseKey}:${paramKey}`);
  }

  setValue(baseKey: string, paramKey: string, value: ValueType, expiresInMs?: number) {
    return this.redisClient.set(`${baseKey}:${paramKey}`, value, 'px', expiresInMs);
  }
}

export default new RedisService();
