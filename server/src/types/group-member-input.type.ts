import { GroupRole } from './group-role.enum';

export type GroupMemberInput = {
  username: string;
  role: GroupRole;
  clientSyncJoinedAt?: Date | null;
};
