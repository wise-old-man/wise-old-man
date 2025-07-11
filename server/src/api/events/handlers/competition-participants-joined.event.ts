import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({
  competitionId,
  participants
}: EventPayloadMap[EventType.COMPETITION_PARTICIPANTS_JOINED]) {}
