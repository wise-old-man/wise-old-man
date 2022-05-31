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
