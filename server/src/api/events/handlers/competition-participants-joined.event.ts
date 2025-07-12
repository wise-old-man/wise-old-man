import { jobManager, JobType } from '../../../jobs';
import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({
  competitionId,
  participants
}: EventPayloadMap[EventType.COMPETITION_PARTICIPANTS_JOINED]) {
  jobManager.add(JobType.UPDATE_NEW_COMPETITION_PARTICIPANTS, {
    competitionId,
    playerIds: participants.map(p => p.playerId)
  });
}
