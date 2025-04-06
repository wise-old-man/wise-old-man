import { jobManager, JobType } from '../../../jobs-new';
import { PERIODS } from '../../../utils';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

function handler({ username, hasChanged, previousUpdatedAt }: EventPayloadMap[EventType.PLAYER_UPDATED]) {
  jobManager.add(JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS, { username });

  if (previousUpdatedAt !== null) {
    for (const period of PERIODS) {
      jobManager.add(JobType.SYNC_PLAYER_DELTAS, { username, period });
    }
  }

  if (hasChanged) {
    jobManager.add(JobType.SYNC_PLAYER_ACHIEVEMENTS, { username, previousUpdatedAt });
  }
}

export default { handler };
