import { z } from 'zod';
import prisma, { modifyPlayer } from '../../../../prisma';
import { PRIVELEGED_GROUP_ROLES } from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { MembershipWithPlayer } from '../group.types';

const inputSchema = z.object({
  id: z.number().positive()
});

type FetchGroupMembersParams = z.infer<typeof inputSchema>;

async function fetchGroupMembers(payload: FetchGroupMembersParams): Promise<MembershipWithPlayer[]> {
  const params = inputSchema.parse(payload);

  const memberships = await prisma.membership.findMany({
    where: { groupId: params.id },
    include: { player: true }
  });

  if (!memberships || memberships.length === 0) {
    const group = await prisma.group.findUnique({
      where: { id: params.id }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    return [];
  }

  const priorities = PRIVELEGED_GROUP_ROLES.reverse();

  // Sort the members list by role
  return memberships
    .map(m => ({ ...m, player: modifyPlayer(m.player) }))
    .sort((a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role));
}

export { fetchGroupMembers };
