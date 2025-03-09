import { createId } from '@paralleldrive/cuid2';
import prisma from '../../../../prisma';
import { buildCompoundRedisKey, redisClient } from '../../../../services/redis.service';

async function createAPIKey(application: string, developer: string) {
  const key = await prisma.apiKey.create({
    data: {
      id: createId(),
      master: false,
      application,
      developer
    }
  });

  await redisClient.set(buildCompoundRedisKey('api-key', key.id), String(key.master));

  return key;
}

export { createAPIKey };
