import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
import { PaginationOptions } from '../../../util/validation';
import { MembershipWithGroup } from '../group.types';

async function findPlayerMemberships(
  playerId: number,
  pagination: PaginationOptions
): Promise<MembershipWithGroup[]> {
  const memberships = await prisma.membership.findMany({
    where: { playerId },
    include: {
      group: {
        include: {
          _count: {
            select: {
              memberships: true
            }
          }
        }
      }
    },
    orderBy: [{ group: { score: 'desc' } }, { createdAt: 'desc' }],
    take: pagination.limit,
    skip: pagination.offset
  });

  return memberships.map(membership => {
    return {
      ...membership,
      group: {
        ...omit(membership.group, '_count', 'verificationHash'),
        memberCount: membership.group._count.memberships
      }
    };
  });
}

export { findPlayerMemberships };
