import { createId } from '@paralleldrive/cuid2';
import { jobManager, JobType } from '../../../../jobs';
import prisma from '../../../../prisma';

async function createAPIKey(application: string, developer: string) {
  const key = await prisma.apiKey.create({
    data: {
      id: createId(),
      master: false,
      application,
      developer
    }
  });

  await jobManager.add(JobType.SYNC_API_KEYS, {});

  return key;
}

export { createAPIKey };
