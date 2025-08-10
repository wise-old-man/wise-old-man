/**
 * Response types are used to format the data returned by the API.
 *
 * Although sometimes very similar to our database models,
 * they often include transformations, additional properties or sensitive field omissions.
 */
import { Group, GroupRoleOrder, GroupSocialLinks, Membership, Player } from '../../types';
import { formatGroupRoleOrderResponse, GroupRoleOrderResponse } from './group-role-order.response';
import { formatGroupSocialLinksResponse, GroupSocialLinksResponse } from './group-social-links.response';
import { formatGroupResponse, GroupResponse } from './group.response';
import { formatMembershipResponse, MembershipResponse } from './membership.response';
import { formatPlayerResponse, PlayerResponse } from './player.response';

export interface GroupDetailsResponse extends GroupResponse {
  socialLinks: GroupSocialLinksResponse;
  roleOrders: Array<GroupRoleOrderResponse>;
  memberships: Array<MembershipResponse & { player: PlayerResponse }>;
}

export function formatGroupDetailsResponse(groupDetails: {
  group: Group;
  memberCount: number;
  socialLinks: GroupSocialLinks | null;
  roleOrders: Array<GroupRoleOrder>;
  memberships: Array<{ membership: Membership; player: Player }>;
}): GroupDetailsResponse {
  return {
    ...formatGroupResponse(groupDetails.group, groupDetails.memberCount),
    socialLinks:
      groupDetails.socialLinks === null
        ? {
            website: null,
            discord: null,
            twitter: null,
            youtube: null,
            twitch: null
          }
        : formatGroupSocialLinksResponse(groupDetails.socialLinks),
    roleOrders: groupDetails.roleOrders.map(r => formatGroupRoleOrderResponse(r)),
    memberships: groupDetails.memberships.map(m => ({
      ...formatMembershipResponse(m.membership),
      player: formatPlayerResponse(m.player)
    }))
  };
}
