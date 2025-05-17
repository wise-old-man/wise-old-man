import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler(_: EventPayloadMap[EventType.PLAYER_ARCHIVED]) {}
