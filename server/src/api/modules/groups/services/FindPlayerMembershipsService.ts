import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { omit } from '../../../util/objects';
import { PaginationOptions } from '../../../util/validation';
import { standardize } from '../../players/player.utils';
import { MembershipWithGroup } from '../group.types';

async function findPlayerMemberships(
  username: string,
  pagination: PaginationOptions
): Promise<MembershipWithGroup[]> {
  const memberships = await prisma.membership.findMany({
    where: {
      player: {
        username: standardize(username)
      }
    },
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

  if (memberships.length === 0) {
    const player = await prisma.player.findFirst({
      where: { username: standardize(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

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
