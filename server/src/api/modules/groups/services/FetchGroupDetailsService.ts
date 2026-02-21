import prisma from '../../../../prisma';
import {
  Group,
  GroupRoleOrder,
  GroupSocialLinks,
  Membership,
  Player,
  PlayerAnnotationType
} from '../../../../types';
import { optOutFilter } from '../../../../utils/shared/player-annotation.utils';
import { NotFoundError } from '../../../errors';
import { sortMembers } from '../group.utils';

async function fetchGroupDetails(id: number): Promise<{
  group: Group;
  socialLinks: GroupSocialLinks | null;
  roleOrders: Array<GroupRoleOrder>;
  memberCount: number;
  memberships: Array<{ membership: Membership; player: Player }>;
}> {
  const group = await prisma.group.findFirst({
    where: { id },
    include: {
      memberships: {
        where: {
          player: {
            ...optOutFilter([PlayerAnnotationType.OPT_OUT, PlayerAnnotationType.OPT_OUT_GROUPS])
          }
        },
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
    group,
    memberCount: group.memberships.length,
    socialLinks: group.socialLinks[0] ?? buildDefaultSocialLinks(group.id),
    roleOrders: group.roleOrders,
    // Sort the members list by role
    memberships: sortMembers(
      group.memberships.map(({ player, ...membership }) => ({ membership, player })),
      group.roleOrders
    )
  };
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

export { fetchGroupDetails };
