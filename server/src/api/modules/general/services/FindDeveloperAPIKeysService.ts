import prisma from '../../../../prisma';

export async function findDeveloperAPIKeys(filters: {
  developer?: string;
  application?: string;
  developerDiscordId?: string;
  createdAt?: Date;
  master?: boolean;
  active?: boolean;
}) {
  const keys = await prisma.apiKey.findMany({ where: filters, orderBy: { id: 'asc' } });
  return keys.map(({ id, ...key }) => ({ ...key, keySuffix: id.slice(-4) }));
}
