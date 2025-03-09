import { redisClient as ext } from '../../../services/redis.service';

async function getValue(baseKey: string, paramKey: string) {
  return await ext.get(`${baseKey}:${paramKey}`);
}

async function setValue(baseKey: string, paramKey: string, value: string | number, expiresInMs?: number) {
  if (expiresInMs === undefined) {
    return ext.set(`${baseKey}:${paramKey}`, value);
  }

  return ext.set(`${baseKey}:${paramKey}`, value, 'PX', expiresInMs);
}

async function deleteKey(key: string) {
  await ext.del(key);
}

export default { getValue, setValue, deleteKey };
