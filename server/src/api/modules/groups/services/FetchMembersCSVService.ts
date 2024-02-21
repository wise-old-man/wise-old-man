import prisma from '../../../../prisma';
import { formatDate } from '../../../util/dates';
import { PRIVELEGED_GROUP_ROLES } from '../../../../utils';
import { BadRequestError, NotFoundError } from '../../../errors';

async function fetchGroupMembersCSV(groupId: number): Promise<string> {
  const memberships = await prisma.membership.findMany({
    where: {
      groupId
    },
    include: {
      player: true
    }
  });

  if (!memberships || memberships.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    throw new BadRequestError('Group has no members.');
  }

  const priorities = [...PRIVELEGED_GROUP_ROLES].reverse();

  const headers = ['Player', 'Role', 'Experience', 'Last progressed', 'Last updated'].join(',');

  const rows = memberships
    .sort((a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role))
    .map(membership => {
      const { role, player } = membership;

      return [
        player.displayName,
        role,
        player.exp,
        player.lastChangedAt ? formatDate(player.lastChangedAt, 'MM/DD/YYYY HH:mm:ss') : '',
        player.updatedAt ? formatDate(player.updatedAt, 'MM/DD/YYYY HH:mm:ss') : ''
      ].join(',');
    });

  return [headers, ...rows].join('\n');
}

export { fetchGroupMembersCSV };
