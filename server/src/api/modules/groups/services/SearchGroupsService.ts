import prisma from '../../../../prisma';
import { Group } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

async function searchGroups(
  name: string | undefined,
  pagination: PaginationOptions
): Promise<
  Array<{
    group: Group;
    memberCount: number;
  }>
> {
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

  return groups.map(group => {
    return {
      group,
      memberCount: group._count.memberships
    };
  });
}

export { searchGroups };
