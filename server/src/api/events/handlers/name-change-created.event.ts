import { jobManager, JobType } from '../../../jobs-new';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ nameChangeId }: EventPayloadMap[EventType.NAME_CHANGE_CREATED]) {
  jobManager.add(JobType.REVIEW_NAME_CHANGE, { nameChangeId });
}
