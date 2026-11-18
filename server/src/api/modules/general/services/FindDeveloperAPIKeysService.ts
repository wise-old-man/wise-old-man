import prisma, { PrismaTypes } from '../../../../prisma';

export async function findDeveloperAPIKeys(filters: {
  developer?: string;
  application?: string;
  developerDiscordId?: string;
  createdAfter?: Date;
  createdBefore?: Date;
  hasCreatedAt?: boolean;
  master?: boolean;
  active?: boolean;
}) {
  const { createdAfter, createdBefore, hasCreatedAt, ...otherFilters } = filters;
  const where: PrismaTypes.ApiKeyWhereInput = { ...otherFilters };

  if (hasCreatedAt !== undefined) {
    where.createdAt = hasCreatedAt ? { not: null } : null;
  }

  if (createdAfter || createdBefore) {
    where.createdAt = { gte: createdAfter, lte: createdBefore };
  }

  const keys = await prisma.apiKey.findMany({
    where,
    orderBy: { id: 'asc' }
  });
  return keys.map(({ id, ...key }) => ({ ...key, keySuffix: id.slice(-4) }));
}
