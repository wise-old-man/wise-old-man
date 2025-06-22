import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ groupId }: EventPayloadMap[EventType.GROUP_CREATED]) {
  jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId });
}
