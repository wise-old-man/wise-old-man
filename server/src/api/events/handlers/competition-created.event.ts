import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ competitionId }: EventPayloadMap[EventType.COMPETITION_CREATED]) {
  jobManager.add(JobType.DISPATCH_COMPETITION_CREATED_DISCORD_EVENT, { competitionId });
  jobManager.add(JobType.RECALCULATE_COMPETITION_TIME_EVENTS, { competitionId });
}
