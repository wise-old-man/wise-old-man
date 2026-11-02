import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Group, Membership } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';
import { standardizeUsername } from '../../players/player.utils';

export async function findPlayerMemberships(
  username: string,
  pagination: PaginationOptions
): AsyncResult<
  Array<{
    membership: Membership;
    group: Group & { memberCount: number };
  }>,
  { code: 'PLAYER_NOT_FOUND' }
> {
  const memberships = await prisma.membership.findMany({
    where: {
      player: {
        username: standardizeUsername(username)
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

    if (player === null) {
      return errored({ code: 'PLAYER_NOT_FOUND' });
    }
  }

  return complete(
    memberships.map(membership => {
      return {
        membership,
        group: {
          ...membership.group,
          memberCount: membership.group._count.memberships
        }
      };
    })
  );
}
