import { createId } from '@paralleldrive/cuid2';
import prisma from '../../../../prisma';
import redisService from '../../../services/external/redis.service';

async function createAPIKey(application: string, developer: string) {
  const key = await prisma.apiKey.create({
    data: {
      id: createId(),
      master: false,
      application,
      developer
    }
  });

  await redisService.setValue('api-key', key.id, String(key.master));

  return key;
}

export { createAPIKey };
