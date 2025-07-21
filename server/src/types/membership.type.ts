import { GroupRole } from './group-role.enum';

export interface Membership {
  playerId: number;
  groupId: number;
  role: GroupRole;
  createdAt: Date;
  updatedAt: Date;
}
