import { z } from 'zod';
import { createId } from '@paralleldrive/cuid2';
import prisma from '../../../../prisma';
import redisService from '../../../services/external/redis.service';

const inputSchema = z.object({
  application: z.string(),
  developer: z.string()
});

type CreateAPIKeyParams = z.infer<typeof inputSchema>;

async function createAPIKey(payload: CreateAPIKeyParams) {
  const params = inputSchema.parse(payload);

  const key = await prisma.apiKey.create({
    data: {
      id: createId(),
      master: false,
      application: params.application,
      developer: params.developer
    }
  });

  await redisService.setValue('api-key', key.id, String(key.master));

  return key;
}

export { createAPIKey };
