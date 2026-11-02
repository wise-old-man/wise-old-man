import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Group, GroupRoleOrder, GroupSocialLinks, Membership, Player } from '../../../../types';
import { sortMembers } from '../group.utils';

export async function fetchGroupDetails(id: number): AsyncResult<
  {
    group: Group;
    socialLinks: GroupSocialLinks | null;
    roleOrders: Array<GroupRoleOrder>;
    memberCount: number;
    memberships: Array<{ membership: Membership; player: Player }>;
  },
  { code: 'GROUP_NOT_FOUND' }
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

  if (group === null) {
    return errored({ code: 'GROUP_NOT_FOUND' });
  }

  // Sort the members list by role
  const sortedMembers = sortMembers(
    group.memberships.map(({ player, ...membership }) => ({ membership, player })),
    group.roleOrders
  );

  return complete({
    group,
    memberCount: group.memberships.length,
    socialLinks: group.socialLinks[0] ?? buildDefaultSocialLinks(group.id),
    roleOrders: group.roleOrders,
    memberships: sortedMembers
  });
}

function buildDefaultSocialLinks(groupId: number): GroupSocialLinks {
  return {
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
