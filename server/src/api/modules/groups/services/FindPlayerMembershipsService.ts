import prisma from '../../../../prisma';
import { Group, Membership, PlayerAnnotationType } from '../../../../types';
import { ForbiddenError, NotFoundError } from '../../../errors';
import { PaginationOptions } from '../../../util/validation';
import { standardizeUsername } from '../../players/player.utils';

export async function findPlayerMemberships(
  username: string,
  pagination: PaginationOptions
): Promise<
  Array<{
    membership: Membership;
    group: Group & { memberCount: number };
  }>
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

  // TODO refactor error handling logic
  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (player.annotations.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError('Player as opted out');
  }

  return player.memberships.map(membership => ({
    membership,
    group: {
      ...membership.group,
      memberCount: membership.group._count.memberships
    }
  }));
}
