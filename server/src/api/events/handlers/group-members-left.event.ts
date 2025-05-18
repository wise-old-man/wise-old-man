import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ groupId, events }: EventPayloadMap[EventType.GROUP_MEMBERS_LEFT]) {
  jobManager.add(JobType.REMOVE_PLAYERS_FROM_GROUP_COMPETITIONS, {
    groupId,
    playerIds: events.map(e => e.playerId)
  });

  // TODO:
  //   // Dispatch this event to the discord service
  //   await prometheus.trackEffect('dispatchMembersLeft', async () => {
  //     await discordService.dispatchMembersLeft(groupId, playerIds);
  //   });

  jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId });
}
