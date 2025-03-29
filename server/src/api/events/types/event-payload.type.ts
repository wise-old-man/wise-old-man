import { EventType } from './event-type.enum';

export type EventPayloadMap = {
  [EventType.PLAYER_UPDATED]: { username: string; hasChanged: boolean };
  [EventType.PLAYER_FLAGGED]: { username: string };
};
