import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ competitionId, minutesLeft }: EventPayloadMap[EventType.COMPETITION_ENDING]) {}
