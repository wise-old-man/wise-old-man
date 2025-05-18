import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ groupId, members }: EventPayloadMap[EventType.GROUP_MEMBERS_JOINED]) {
  jobManager.add(JobType.ADD_PLAYERS_TO_GROUP_COMPETITIONS, {
    groupId,
    playerIds: members.map(e => e.playerId)
  });

  jobManager.add(JobType.DISPATCH_MEMBERS_JOINED_DISCORD_EVENT, {
    groupId,
    members
  });

  jobManager.add(JobType.UPDATE_NEW_GROUP_MEMBERS, {
    groupId,
    playerIds: members.map(e => e.playerId)
  });

  jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId });
}
