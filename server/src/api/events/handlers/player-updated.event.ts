import { jobManager, JobType } from '../../../jobs-new';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

function handler({ username, hasChanged }: EventPayloadMap[EventType.PLAYER_UPDATED]) {
  // TODO: dispatch task to sync deltas

  jobManager.add(JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS, { username });

  if (hasChanged) {
    jobManager.add(JobType.SYNC_PLAYER_ACHIEVEMENTS, { username });
  }
}

export default { handler };
