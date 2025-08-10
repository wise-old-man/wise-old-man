import { jobManager, JobType } from '../../../jobs';
import { PlayerType } from '../../../types';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ username, previousType, newType }: EventPayloadMap[EventType.PLAYER_TYPE_CHANGED]) {
  if (previousType === PlayerType.HARDCORE && newType === PlayerType.IRONMAN) {
    jobManager.add(JobType.DISPATCH_MEMBER_HCIM_DIED_DISCORD_EVENT, { username });
  }
}
