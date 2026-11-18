import prisma from '../../../../prisma';

export async function updateDeveloperAPIKeys(developer: string, developerDiscordId: string) {
  const result = await prisma.apiKey.updateMany({
    where: { developer },
    data: { developerDiscordId }
  });

  return { updatedCount: result.count };
}
