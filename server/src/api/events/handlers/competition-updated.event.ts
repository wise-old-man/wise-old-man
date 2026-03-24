import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ competitionId }: EventPayloadMap[EventType.COMPETITION_UPDATED]) {
  jobManager.add(JobType.RECALCULATE_COMPETITION_TIME_EVENTS, { competitionId });
}
