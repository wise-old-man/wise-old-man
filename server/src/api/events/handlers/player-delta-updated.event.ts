import { jobManager, JobType } from '../../../jobs-new';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ isPotentialRecord, ...args }: EventPayloadMap[EventType.PLAYER_DELTA_UPDATED]) {
  if (!isPotentialRecord) {
    return;
  }

  jobManager.add(JobType.SYNC_PLAYER_RECORDS, { ...args });
}
