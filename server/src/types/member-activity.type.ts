import { GroupRole } from './group-role.enum';
import { MemberActivityType } from './member-activity-type.enum';

export interface MemberActivity {
  groupId: number;
  playerId: number;
  type: MemberActivityType;
  role: GroupRole | null;
  previousRole: GroupRole | null;
  createdAt: Date;
}
