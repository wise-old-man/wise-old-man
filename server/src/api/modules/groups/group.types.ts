import { GroupRole } from '../../../utils';
import { Group, Membership, Player } from '../../../prisma';

export interface GroupWithCount extends Omit<Group, 'verificationHash'> {
  memberCount: number;
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
