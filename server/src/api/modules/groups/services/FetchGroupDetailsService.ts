import prisma from '../../../../prisma';
import { Group, GroupRoleOrder, GroupSocialLinks, Membership, Player } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { sortMembers } from '../group.utils';

async function fetchGroupDetails(id: number): Promise<
  Group & {
    socialLinks: GroupSocialLinks | null;
    roleOrders: Array<GroupRoleOrder>;
    memberCount: number;
    memberships: Array<Membership & { player: Player }>;
  }
> {
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
      }
    }
  });

  if (!group) {
    throw new NotFoundError('Group not found.');
  }

  return {
    ...group,
    memberCount: group.memberships.length,
    socialLinks: group.socialLinks[0] ?? buildDefaultSocialLinks(group.id),
    roleOrders: group.roleOrders,
    // Sort the members list by role
    memberships: sortMembers(group.memberships, group.roleOrders)
  };
}

function buildDefaultSocialLinks(groupId: number): GroupSocialLinks {
  return {
    id: -1,
    groupId: groupId,
    website: null,
    discord: null,
    twitter: null,
    youtube: null,
    twitch: null,
    createdAt: new Date(),
    updatedAt: new Date()
  };
}

export { fetchGroupDetails };
