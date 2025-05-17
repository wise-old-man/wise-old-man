import { jobManager, JobType } from '../../../jobs-new';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ username, previousDisplayName }: EventPayloadMap[EventType.PLAYER_NAME_CHANGED]) {
  jobManager.add(JobType.DISPATCH_MEMBER_NAME_CHANGED_DISCORD_EVENT, { username, previousDisplayName });
  jobManager.add(JobType.UPDATE_PLAYER, { username, source: 'on-player-name-changed' });
  jobManager.add(JobType.ASSERT_PLAYER_TYPE, { username });

  // Reevaluate this player's achievements to try and find earlier completion dates as there might be new data
  jobManager.add(JobType.RECALCULATE_PLAYER_ACHIEVEMENTS, { username });
}
