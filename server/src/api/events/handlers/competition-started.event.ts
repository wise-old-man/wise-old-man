import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ competitionId }: EventPayloadMap[EventType.COMPETITION_STARTED]) {
  jobManager.add(JobType.DISPATCH_COMPETITION_STARTED_DISCORD_EVENT, { competitionId });
  jobManager.add(JobType.UPDATE_COMPETITION_SCORE, { competitionId });

  jobManager.add(JobType.UPDATE_COMPETITION_PARTICIPANTS, {
    competitionId,
    trigger: 'competition-started'
  });
}
