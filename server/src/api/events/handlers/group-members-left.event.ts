import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ groupId, members }: EventPayloadMap[EventType.GROUP_MEMBERS_LEFT]) {
  jobManager.add(JobType.REMOVE_PLAYERS_FROM_GROUP_COMPETITIONS, {
    groupId,
    playerIds: members.map(e => e.playerId)
  });

  jobManager.add(JobType.DISPATCH_MEMBERS_LEFT_DISCORD_EVENT, {
    groupId,
    playerIds: members.map(e => e.playerId)
  });

  jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId });
}
