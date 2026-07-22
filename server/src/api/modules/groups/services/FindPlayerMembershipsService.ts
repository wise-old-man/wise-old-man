import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Group, Membership, PlayerAnnotationType } from '../../../../types';
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
  { code: 'PLAYER_NOT_FOUND' } | { code: 'PLAYER_OPTED_OUT' }
> {
  const player = await prisma.player.findFirst({
    where: { username: standardizeUsername(username) },
    include: {
      annotations: true,
      memberships: {
        where: {
          group: { visible: true }
        },
        include: {
          group: {
            include: {
              _count: {
                select: { memberships: true }
              }
            }
          }
        },
        orderBy: [{ group: { score: 'desc' } }, { createdAt: 'desc' }],
        take: pagination.limit,
        skip: pagination.offset
      }
    }
  });

  if (!player) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    return errored({ code: 'PLAYER_OPTED_OUT' });
  }

  return complete(
    player.memberships.map(membership => ({
      membership,
      group: {
        ...membership.group,
        memberCount: membership.group._count.memberships
      }
    }))
  );
}
