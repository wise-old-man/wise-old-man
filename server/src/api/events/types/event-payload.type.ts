import { EventType } from './event-type.enum';

export type EventPayloadMap = {
  [EventType.NAME_CHANGE_CREATED]: { nameChangeId: number };
  [EventType.PLAYER_UPDATED]: { username: string; hasChanged: boolean; previousSnapshotId: number | null };
};
