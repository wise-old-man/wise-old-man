import { GroupRole } from '../../../utils';
import { Group, Membership, Player, MemberActivity, GroupSocialLinks, GroupRoleOrder } from '../../../prisma';
import { MetricLeaders, FormattedSnapshot } from '../snapshots/snapshot.types';

export { ActivityType } from '../../../prisma/enum-adapter';

export interface GroupListItem extends Omit<Group, 'verificationHash'> {
  memberCount: number;
}

export interface GroupDetails extends GroupListItem {
  socialLinks: GroupSocialLinks;
  memberships: MembershipWithPlayer[];
  roleOrders: GroupRoleOrder[];
}

export interface MembershipWithGroup extends Membership {
  group: GroupListItem;
}

export interface MembershipWithPlayer extends Membership {
  player: Player;
}

export interface MemberInput {
  username: string;
  role: string | GroupRole;
}

export interface GroupHiscoresSkillItem {
  type: 'skill';
  rank: number;
  level: number;
  experience: number;
}

export interface GroupHiscoresBossItem {
  type: 'boss';
  rank: number;
  kills: number;
}

export interface GroupHiscoresActivityItem {
  type: 'activity';
  rank: number;
  score: number;
}

export interface GroupHiscoresComputedMetricItem {
  type: 'computed';
  rank: number;
  value: number;
}

export interface GroupHiscoresEntry {
  player: Player;
  data:
    | GroupHiscoresSkillItem
    | GroupHiscoresBossItem
    | GroupHiscoresActivityItem
    | GroupHiscoresComputedMetricItem;
}

export interface GroupStatistics {
  maxedCombatCount: number;
  maxedTotalCount: number;
  maxed200msCount: number;
  averageStats: FormattedSnapshot;
  metricLeaders: MetricLeaders;
}

export type MemberRoleChangeEvent = Omit<MemberActivity, 'createdAt'>;

export type MemberJoinedEvent = Omit<MemberActivity, 'createdAt' | 'previousRole'>;

export type MemberLeftEvent = Omit<MemberActivity, 'createdAt' | 'previousRole'>;

export type MemberActivityWithPlayer = MemberActivity & {
  player: Player;
};

export { Group, Membership, MemberActivity, GroupRoleOrder };
