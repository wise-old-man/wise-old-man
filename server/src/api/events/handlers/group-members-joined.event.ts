import { EventPayloadMap } from '../types/event-payload.type';
import { EventType } from '../types/event-type.enum';

export function handler({ groupId, events }: EventPayloadMap[EventType.GROUP_MEMBERS_JOINED]) {}
