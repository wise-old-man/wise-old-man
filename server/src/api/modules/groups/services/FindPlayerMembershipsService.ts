import prisma from '../../../../prisma';
import { Group, Membership, PlayerAnnotationType } from '../../../../types';
import { optOutFilter } from '../../../../utils/shared/player-annotation.utils';
import { NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';
import { standardizeUsername } from '../../players/player.utils';

async function findPlayerMemberships(
  username: string,
  pagination: PaginationOptions
): Promise<
  Array<{
    membership: Membership;
    group: Group & { memberCount: number };
  }>
> {
  const memberships = await prisma.membership.findMany({
    where: {
      player: {
        username: standardizeUsername(username)
        ...optOutFilter([PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_GROUPS])
      },
      group: {
        visible: true
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
      where: { username: standardizeUsername(username) }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return memberships.map(membership => {
    return {
      membership,
      group: {
        ...membership.group,
        memberCount: membership.group._count.memberships
      }
    };
  });
}

export { findPlayerMemberships };
