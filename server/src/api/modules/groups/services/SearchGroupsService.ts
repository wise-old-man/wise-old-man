import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
import { PaginationOptions } from '../../../util/validation';
import { GroupListItem } from '../group.types';

async function searchGroups(
  name: string | undefined,
  pagination: PaginationOptions
): Promise<GroupListItem[]> {
  const groups = await prisma.group.findMany({
    where: {
      name: {
        contains: name ? name.trim() : name,
        mode: 'insensitive'
      }
    },
    include: {
      _count: {
        select: {
          memberships: true
        }
      }
    },
    orderBy: [{ score: 'desc' }, { id: 'asc' }],
    take: pagination.limit,
    skip: pagination.offset
  });

  return groups.map(g => {
    return {
      ...omit(g, '_count', 'verificationHash'),
      memberCount: g._count.memberships
    };
  });
}

export { searchGroups };
