import { createId } from '@paralleldrive/cuid2';
import prisma from '../../../../prisma';
import { jobManager, JobType } from '../../../../jobs-new';

async function createAPIKey(application: string, developer: string) {
  const key = await prisma.apiKey.create({
    data: {
      id: createId(),
      master: false,
      application,
      developer
    }
  });

  jobManager.add(JobType.SYNC_API_KEYS, {});

  return key;
}

export { createAPIKey };
