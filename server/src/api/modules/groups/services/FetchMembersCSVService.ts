import { AsyncResult, complete, errored } from '@attio/fetchable';
import dayjs from 'dayjs';
import prisma from '../../../../prisma';
import { Membership, Player } from '../../../../types';
import { sortMembers } from '../group.utils';

export async function fetchGroupMembersCSV(
  groupId: number
): AsyncResult<string, { code: 'GROUP_NOT_FOUND' }> {
  const [group, memberships] = await Promise.all([
    prisma.group.findFirst({
      where: { id: groupId },
      include: {
        roleOrders: true
      }
    }),
    prisma.membership.findMany({
      where: {
        groupId
      },
      include: {
        player: true
      }
    })
  ]);

  if (group === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  const headers = [
    'Player',
    'Role',
    'Experience',
    'Last progressed',
    'Last updated',
    'Joined at (Client Sync)'
  ].join(',');

  const sortedMembers = sortMembers(
    memberships.map(({ player, ...membership }) => ({
      membership,
      player
    })),
    group.roleOrders
  ) as { membership: Membership; player: Player }[];

  const rows = sortedMembers.map(({ player, membership }) => {
    return [
      player.displayName,
      membership.role,
      player.exp,
      player.lastChangedAt ? dayjs(player.lastChangedAt).format('MM/DD/YYYY HH:mm:ss') : '',
      player.updatedAt ? dayjs(player.updatedAt).format('MM/DD/YYYY HH:mm:ss') : '',
      membership.clientSyncJoinedAt ? dayjs(membership.clientSyncJoinedAt).format('MM/DD/YYYY') : ''
    ].join(',');
  });

  return complete([headers, ...rows].join('\n'));
}
