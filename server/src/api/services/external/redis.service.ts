import IORedis, { ValueType } from 'ioredis';
import redisConfig from '../../jobs/config/redis';

class RedisService {
  redisClient: IORedis.Redis;

  constructor() {
    this.redisClient = new IORedis(redisConfig);
  }

  async getValue(baseKey: string, paramKey: string) {
    return await this.redisClient.get(`${baseKey}:${paramKey}`);
  }

  async setValue(baseKey: string, paramKey: string, value: ValueType, expiresInMs?: number) {
    return await this.redisClient.set(`${baseKey}:${paramKey}`, value, 'px', expiresInMs);
  }

  async deleteKey(key: string) {
    await this.redisClient.del(key);
  }

  async flushAll() {
    await this.redisClient.flushall();
  }
}

export default new RedisService();
