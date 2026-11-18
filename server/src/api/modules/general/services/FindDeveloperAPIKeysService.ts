import prisma from '../../../../prisma';

export function findDeveloperAPIKeys(filters: { developer?: string; developerDiscordId?: string }) {
  return prisma.apiKey.findMany({ where: filters, orderBy: { id: 'asc' } });
}
