import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ competitionId, minutesLeft }: EventPayloadMap[EventType.COMPETITION_STARTING]) {
  jobManager.add(JobType.DISPATCH_COMPETITION_STARTING_DISCORD_EVENT, {
    competitionId,
    minutesLeft
  });
}
