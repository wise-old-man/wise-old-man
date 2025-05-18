import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ groupId, members }: EventPayloadMap[EventType.GROUP_MEMBERS_ROLES_CHANGED]) {
  jobManager.add(JobType.DISPATCH_MEMBERS_ROLES_CHANGED_DISCORD_EVENT, {
    groupId,
    members
  });
}
