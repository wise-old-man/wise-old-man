import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ competitionId }: EventPayloadMap[EventType.COMPETITION_STARTED]) {}
