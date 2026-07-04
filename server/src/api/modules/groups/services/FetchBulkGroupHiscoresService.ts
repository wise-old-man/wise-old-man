import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Player, Snapshot } from '../../../../types';

export async function fetchBulkGroupHiscores(
  groupId: number
): AsyncResult<Array<{ player: Player; snapshot: Snapshot }>, { code: 'GROUP_NOT_FOUND' }> {
  const memberships = await prisma.membership.findMany({
    where: { groupId },
    include: {
      player: {
        include: {
          latestSnapshot: true
        }
      }
    }
  });

  if (memberships.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (group === null) {
      return errored({ code: 'GROUP_NOT_FOUND' });
    }

    return complete([]);
  }

  return complete(
    memberships
      .filter(m => m.player.latestSnapshot !== null)
      .map(m => ({
        player: m.player,
        snapshot: m.player.latestSnapshot!
      }))
  );
}
