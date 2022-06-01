import { GroupRole } from '../../../utils';
import { Group, Membership, Player } from '../../../prisma';
import { FormattedSnapshot } from '../snapshots/snapshot.types';

export interface GroupWithCount extends Omit<Group, 'verificationHash'> {
  memberCount: number;
}

export interface GroupWithMemberships extends GroupWithCount {
  memberships: MembershipWithPlayer[];
}

export interface MembershipWithGroup extends Membership {
  group: GroupWithCount;
}

export interface MembershipWithPlayer extends Membership {
  player: Player;
}

export interface MemberInput {
  username: string;
  role: string | GroupRole;
}

interface SkillHiscoresItem {
  rank: number;
  level: number;
  experience: number;
}

interface BossHiscoresItem {
  rank: number;
  kills: number;
}

interface ActivityHiscoresItem {
  rank: number;
  score: number;
}

interface VirtualHiscoresItem {
  rank: number;
  value: number;
}

export interface GroupHiscoresEntry {
  membership: MembershipWithPlayer;
  data: SkillHiscoresItem | BossHiscoresItem | ActivityHiscoresItem | VirtualHiscoresItem;
}

export interface GroupStatistics {
  maxedCombatCount: number;
  maxedTotalCount: number;
  maxed200msCount: number;
  averageStats: FormattedSnapshot;
}
