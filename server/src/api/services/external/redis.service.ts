import IORedis from 'ioredis';
import redisConfig from '../../../config/redis.config';

class RedisService {
  redisClient: IORedis;

  constructor() {
    this.redisClient = new IORedis(redisConfig);
  }

  async getValue(baseKey: string, paramKey: string) {
    return await this.redisClient.get(`${baseKey}:${paramKey}`);
  }

  async setValue(baseKey: string, paramKey: string, value: string | number, expiresInMs?: number) {
    return await this.redisClient.set(`${baseKey}:${paramKey}`, value, 'PX', expiresInMs);
  }

  async deleteKey(key: string) {
    await this.redisClient.del(key);
  }

  async flushAll() {
    await this.redisClient.flushall();
  }

  shutdown() {
    this.redisClient.disconnect();
  }
}

export default new RedisService();
