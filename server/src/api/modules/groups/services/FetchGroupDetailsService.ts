import prisma from '../../../../prisma';
import { omit } from '../../../util/objects';
import { NotFoundError } from '../../../errors';
import { GroupDetails } from '../group.types';
import { buildDefaultSocialLinks, sortMembers } from '../group.utils';

async function fetchGroupDetails(id: number): Promise<GroupDetails> {
  const group = await prisma.group.findFirst({
    where: { id },
    include: {
      memberships: {
        include: { player: true }
      },
      socialLinks: true,
      roleOrders: {
        orderBy: {
          index: 'asc'
        }
      },
      tags: {
        orderBy: {
          index: 'asc'
        }
      }
    }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  return {
    ...omit(group, 'verificationHash'),
    socialLinks: group.socialLinks[0] ?? buildDefaultSocialLinks(),
    memberCount: group.memberships.length,
    // Sort the members list by role
    memberships: sortMembers(group.memberships, group.roleOrders),
    roleOrders: group.roleOrders,
    tags: group.tags
  };
}

export { fetchGroupDetails };
