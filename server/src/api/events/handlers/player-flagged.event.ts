import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler(payload: EventPayloadMap[EventType.PLAYER_FLAGGED]) {
  jobManager.add(JobType.DISPATCH_PLAYER_FLAGGED_DISCORD_EVENT, payload);
}
