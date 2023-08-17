import { z } from 'zod';
import prisma from '../../../../prisma';
import { PRIVELEGED_GROUP_ROLES } from '../../../..//utils';
import { omit } from '../../../util/objects';
import { NotFoundError } from '../../../errors';
import { GroupDetails } from '../group.types';

const inputSchema = z.object({
  id: z.number().positive()
});

type FetchGroupDetailsParams = z.infer<typeof inputSchema>;

async function fetchGroupDetails(payload: FetchGroupDetailsParams): Promise<GroupDetails> {
  const params = inputSchema.parse(payload);

  const group = await prisma.group.findFirst({
    where: { id: params.id },
    include: {
      memberships: {
        include: { player: true }
      }
    }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  const priorities = PRIVELEGED_GROUP_ROLES.reverse();

  return {
    ...omit(group, 'verificationHash'),
    memberCount: group.memberships.length,
    // Sort the members list by role
    memberships: group.memberships.sort(
      (a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role)
    )
  };
}

export { fetchGroupDetails };
