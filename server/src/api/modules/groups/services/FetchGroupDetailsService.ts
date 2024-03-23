import prisma from '../../../../prisma';
import { PRIVELEGED_GROUP_ROLES } from '../../../..//utils';
import { omit } from '../../../util/objects';
import { NotFoundError } from '../../../errors';
import { GroupDetails } from '../group.types';
import { buildDefaultSocialLinks } from '../group.utils';

async function fetchGroupDetails(id: number): Promise<GroupDetails> {
  const group = await prisma.group.findFirst({
    where: { id },
    include: {
      memberships: {
        include: { player: true }
      },
      socialLinks: true,
      roleOrders: true
    }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  const priorities = [...PRIVELEGED_GROUP_ROLES].reverse();

  return {
    ...omit(group, 'verificationHash'),
    socialLinks: group.socialLinks[0] ?? buildDefaultSocialLinks(),
    memberCount: group.memberships.length,
    // Sort the members list by role
    memberships: group.memberships.sort(
      (a, b) => priorities.indexOf(b.role) - priorities.indexOf(a.role) || a.role.localeCompare(b.role)
    ),
    roleOrders: group.roleOrders
  };
}

export { fetchGroupDetails };
