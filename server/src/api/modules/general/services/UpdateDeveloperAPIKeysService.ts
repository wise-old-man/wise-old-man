import prisma from '../../../../prisma';

export async function updateDeveloperAPIKeys(
  developer: string,
  data: { developerDiscordId?: string; createdAt?: Date | null }
) {
  const result = await prisma.apiKey.updateMany({
    where: { developer },
    data
  });

  return { updatedCount: result.count };
}
