import { GroupRole } from '../../../utils';
import { Group, Membership, Player, MemberActivity } from '../../../prisma';
import { MetricLeaders, FormattedSnapshot } from '../snapshots/snapshot.types';

export { ActivityType } from '../../../prisma/enum-adapter';

export interface GroupListItem extends Omit<Group, 'verificationHash'> {
  memberCount: number;
}

export interface GroupDetails extends GroupListItem {
  memberships: MembershipWithPlayer[];
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
  rank: number;
  level: number;
  experience: number;
}

export interface GroupHiscoresBossItem {
  rank: number;
  kills: number;
}

export interface GroupHiscoresActivityItem {
  rank: number;
  score: number;
}

export interface GroupHiscoresComputedMetricItem {
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

export enum MigrationDataSource {
  TEMPLE_OSRS,
  CRYSTAL_MATH_LABS
}

export interface CMLGroupData {
  name: string;
  members: string[];
}

export interface TempleGroupData {
  name: string;
  members: string[];
  leaders: string[];
}

export type MemberRoleChangeEvent = Omit<MemberActivity, 'createdAt'> & {
  previousRole: GroupRole;
  displayName: string;
};

export type MemberJoinedEvent = Omit<MemberActivity, 'createdAt'>;

export type MemberLeftEvent = Omit<MemberActivity, 'createdAt' | 'role'>;

export { Group, Membership, MemberActivity };
