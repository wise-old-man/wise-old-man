import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ groupId, events }: EventPayloadMap[EventType.GROUP_MEMBERS_JOINED]) {
  jobManager.add(JobType.ADD_PLAYERS_TO_GROUP_COMPETITIONS, {
    groupId,
    playerIds: events.map(e => e.playerId)
  });

  // TODO:
  //     await discordService.dispatchMembersJoined(groupId, events, players);

  //   // Request updates for any new players
  //   players.forEach(({ username, type, registeredAt }) => {
  //     if (type !== PlayerType.UNKNOWN || Date.now() - registeredAt.getTime() > 60_000) {
  //       return;
  //     }

  //     jobManager.add(JobType.UPDATE_PLAYER, { username, source: 'on-members-joined' });
  //   });

  jobManager.add(JobType.UPDATE_GROUP_SCORE, { groupId });
}
