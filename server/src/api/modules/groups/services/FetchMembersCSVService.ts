import { z } from 'zod';
import prisma from '../../../../prisma';
import { PRIVELEGED_GROUP_ROLES } from '../../../../utils';
import { BadRequestError, NotFoundError } from '../../../errors';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type FetchMembersCSVParams = z.infer<typeof inputSchema>;

async function fetchGroupMembersCSV(payload: FetchMembersCSVParams): Promise<string> {
  const params = inputSchema.parse(payload);

  const memberships = await prisma.membership.findMany({
    where: {
      groupId: params.id
    },
    include: {
      player: true
    }
  });

  if (!memberships || memberships.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: params.id }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    throw new BadRequestError('Group has no members.');
  }

  const priorities = PRIVELEGED_GROUP_ROLES.reverse();

  const headers = ['Player', 'Role'].join(',');

  const rows = memberships
    .sort((a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role))
    .map(membership => [membership.player.displayName, membership.role].join(','));

  return [headers, ...rows].join('\n');
}

export { fetchGroupMembersCSV };
