import { jobManager, JobType } from '../../../../jobs';
import prisma from '../../../../prisma';

export async function revokeDiscordDeveloperAPIKeys(developerDiscordId: string) {
  const result = await prisma.apiKey.updateMany({
    where: { developerDiscordId, active: true },
    data: { active: false }
  });

  await jobManager.add(JobType.SYNC_API_KEYS, {});

  return { revokedCount: result.count };
}
