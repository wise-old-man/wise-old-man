import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ competitionId, minutesLeft }: EventPayloadMap[EventType.COMPETITION_ENDING]) {
  jobManager.add(JobType.DISPATCH_COMPETITION_ENDING_DISCORD_EVENT, {
    competitionId,
    minutesLeft
  });

  if (minutesLeft === 120) {
    // 2 hours before a competition ends, update any players that are actually competing in the competition,
    // this is just a precaution in case the competition manager forgets to update people before the end.
    // With this, we can ensure that any serious competitors will at least be updated once 2 hours before it ends.
    // Note: We're doing this 2 hours before, because that'll still allow "update all" to update these players in the final hour.
    jobManager.add(JobType.UPDATE_COMPETITION_PARTICIPANTS, {
      competitionId,
      trigger: 'competition-ending-2h'
    });

    return;
  }

  if (minutesLeft === 720) {
    // 12 hours before a competition ends, update all participants. This solves a fairly rare occurence
    // where a player is actively competing, but has only been updated once at the start of the competition.
    // By updating them again 12h before it ends, that'll award them some gains, ensuring they get updated twice,
    // and making them an active competitor. This active competitor status is important for the code block above this,
    // where 2h before a competition ends, all active competitors get updated again.
    // Note: These should be low priority updates as to not delay regularly scheduled updates. 10-12h should be more than enough
    // for these to slowly get processed.
    jobManager.add(JobType.UPDATE_COMPETITION_PARTICIPANTS, {
      competitionId,
      trigger: 'competition-ending-12h'
    });
  }
}
