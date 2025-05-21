import { jobManager, JobType } from '../../../jobs';
import { standardize } from '../../modules/players/player.utils';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ username, previousDisplayName }: EventPayloadMap[EventType.PLAYER_NAME_CHANGED]) {
  jobManager.add(JobType.UPDATE_PLAYER, { username, source: 'on-player-name-changed' });

  if (standardize(username) !== standardize(previousDisplayName)) {
    jobManager.add(JobType.ASSERT_PLAYER_TYPE, { username });
    jobManager.add(JobType.DISPATCH_MEMBER_NAME_CHANGED_DISCORD_EVENT, { username, previousDisplayName });

    // Reevaluate this player's achievements to try and find earlier completion dates as there might be new data
    jobManager.add(JobType.RECALCULATE_PLAYER_ACHIEVEMENTS, { username });
  }
}
