import prisma, { PrismaTypes } from '../../../../prisma';
import { NameChange, NameChangeStatus } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

async function searchNameChanges(
  username: string | undefined,
  status: NameChangeStatus | undefined,
  pagination: PaginationOptions
): Promise<NameChange[]> {
  const query: PrismaTypes.NameChangeWhereInput = {};

  if (status) {
    query.status = status;
  }

  if (username && username.length > 0) {
    const startsWith = username.trim();

    query.OR = [
      { oldName: { startsWith, mode: 'insensitive' } },
      { newName: { startsWith, mode: 'insensitive' } }
    ];
  }

  const nameChanges = await prisma.nameChange.findMany({
    where: { ...query },
    orderBy: { createdAt: 'desc' },
    take: pagination.limit,
    skip: pagination.offset
  });

  return nameChanges as NameChange[];
}

export { searchNameChanges };
