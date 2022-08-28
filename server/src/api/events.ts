import { Player, Snapshot } from '../prisma';
import { PlayerType } from '../utils';
import { onPlayerTypeChanged, onPlayerUpdated } from '../api/modules/players/player.events';

export const EVENT_COLLECTOR: Event[] = [];

type ActionMap<M extends { [index: string]: unknown }> = {
  [Key in keyof M]: M[Key] extends undefined ? { type: Key } : { type: Key; payload: M[Key] };
};

type Event = ActionMap<EventPayloadMap>[keyof ActionMap<EventPayloadMap>];

export enum EventType {
  PLAYER_TYPE_CHANGED = 'PLAYER_TYPE_CHANGED',
  PLAYER_UPDATED = 'PLAYER_UPDATED'
}

type EventPayloadMap = {
  [EventType.PLAYER_UPDATED]: { player: Player; snapshot: Snapshot; hasChanged: boolean };
  [EventType.PLAYER_TYPE_CHANGED]: { player: Player; previousType: PlayerType };
};

function dispatch(event: Event) {
  EVENT_COLLECTOR.push(event);

  if (event.type === EventType.PLAYER_TYPE_CHANGED) {
    return onPlayerTypeChanged(event.payload.player, event.payload.previousType);
  }

  if (event.type === EventType.PLAYER_UPDATED) {
    return onPlayerUpdated(event.payload.player, event.payload.snapshot, event.payload.hasChanged);
  }
}

export default {
  dispatch
};
