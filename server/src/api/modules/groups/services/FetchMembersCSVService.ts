import dayjs from 'dayjs';
import prisma from '../../../../prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { sortMembers } from '../group.utils';
import { Membership, Player } from '../../../../types';

async function fetchGroupMembersCSV(groupId: number): Promise<string> {
  const memberships = await prisma.membership.findMany({
    where: {
      groupId
    },
    include: {
      player: true
    }
  });

  const group = await prisma.group.findFirst({
    where: { id: groupId },
    include: {
      roleOrders: true
    }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  if (!memberships || memberships.length === 0) {
    throw new BadRequestError('Group has no members.');
  }

  const headers = [
    'Player',
    'Role',
    'Experience',
    'Last progressed',
    'Last updated',
    'Joined at (Client Sync)'
  ].join(',');

  const rows = (
    sortMembers(
      memberships.map(({ player, ...membership }) => ({ membership, player })),
      group.roleOrders
    ) as { membership: Membership; player: Player }[]
  ).map(({ player, membership }) => {
    return [
      player.displayName,
      membership.role,
      player.exp,
      player.lastChangedAt ? dayjs(player.lastChangedAt).format('MM/DD/YYYY HH:mm:ss') : '',
      player.updatedAt ? dayjs(player.updatedAt).format('MM/DD/YYYY HH:mm:ss') : '',
      membership.clientSyncJoinedAt ? dayjs(membership.clientSyncJoinedAt).format('MM/DD/YYYY') : ''
    ].join(',');
  });

  return [headers, ...rows].join('\n');
}

export { fetchGroupMembersCSV };
