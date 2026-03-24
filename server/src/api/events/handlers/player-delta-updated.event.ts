import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({
  username,
  period,
  isPotentialRecord
}: EventPayloadMap[EventType.PLAYER_DELTA_UPDATED]) {
  if (!isPotentialRecord) {
    return;
  }

  jobManager.add(JobType.SYNC_PLAYER_RECORDS, { username, period });
}
