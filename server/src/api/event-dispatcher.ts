import { Delta, Player, Snapshot } from '../prisma';
import { NameChange, PlayerType } from '../utils';
import { onDeltaUpdated } from './modules/deltas/delta.events';
import { onNameChangeSubmitted } from './modules/name-changes/name-change.events';
import {
  onPlayerImported,
  onPlayerNameChanged,
  onPlayerTypeChanged,
  onPlayerUpdated
} from './modules/players/player.events';

export const EVENT_REGISTRY: Event[] = [];

type ActionMap<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

type Event = ActionMap<EventPayloadMap>[keyof ActionMap<EventPayloadMap>];

export enum EventType {
  // Player Events
  PLAYER_UPDATED = 'PLAYER_UPDATED',
  PLAYER_TYPE_CHANGED = 'PLAYER_TYPE_CHANGED',
  PLAYER_NAME_CHANGED = 'PLAYER_NAME_CHANGED',
  PLAYER_HISTORY_IMPORTED = 'PLAYER_HISTORY_IMPORTED',
  // Delta Events
  DELTA_UPDATED = 'DELTA_UPDATED',
  // Name Change Events
  NAME_CHANGE_SUBMITTED = 'NAME_CHANGE_SUBMITTED'
}

type EventPayloadMap = {
  // Player Events
  [EventType.PLAYER_HISTORY_IMPORTED]: { playerId: number };
  [EventType.PLAYER_NAME_CHANGED]: { player: Player; previousName: string };
  [EventType.PLAYER_TYPE_CHANGED]: { player: Player; previousType: PlayerType };
  [EventType.PLAYER_UPDATED]: { player: Player; snapshot: Snapshot; hasChanged: boolean };
  // Delta Events
  [EventType.DELTA_UPDATED]: { delta: Delta; isPotentialRecord: boolean };
  // Name Change Events
  [EventType.NAME_CHANGE_SUBMITTED]: { nameChange: NameChange };
};

function dispatch(event: Event) {
  EVENT_REGISTRY.push(event);

  switch (event.type) {
    case EventType.PLAYER_TYPE_CHANGED:
      return onPlayerTypeChanged(event.payload.player, event.payload.previousType);
    case EventType.PLAYER_NAME_CHANGED:
      return onPlayerNameChanged(event.payload.player, event.payload.previousName);
    case EventType.PLAYER_UPDATED:
      return onPlayerUpdated(event.payload.player, event.payload.snapshot, event.payload.hasChanged);
    case EventType.PLAYER_HISTORY_IMPORTED:
      return onPlayerImported(event.payload.playerId);
    case EventType.DELTA_UPDATED:
      return onDeltaUpdated(event.payload.delta, event.payload.isPotentialRecord);
    case EventType.NAME_CHANGE_SUBMITTED:
      return onNameChangeSubmitted(event.payload.nameChange);
  }
}

export default {
  dispatch
};
