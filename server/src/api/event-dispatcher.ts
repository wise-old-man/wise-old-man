import { Delta, Player, Snapshot, Achievement, NameChange } from '../prisma';
import { PlayerType } from '../utils';
import * as deltaEvents from './modules/deltas/delta.events';
import * as playerEvents from './modules/players/player.events';
import * as nameChangeEvents from './modules/name-changes/name-change.events';
import * as achievementEvents from './modules/achievements/achievement.events';

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
  NAME_CHANGE_SUBMITTED = 'NAME_CHANGE_SUBMITTED',
  // Achievement Events
  ACHIEVEMENTS_CREATED = 'ACHIEVEMENTS_CREATED'
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
  // Achievement Events
  [EventType.ACHIEVEMENTS_CREATED]: { achievements: Achievement[] };
};

function dispatch(evt: Event) {
  EVENT_REGISTRY.push(evt);

  switch (evt.type) {
    case EventType.PLAYER_TYPE_CHANGED:
      return playerEvents.onPlayerTypeChanged(evt.payload.player, evt.payload.previousType);
    case EventType.PLAYER_NAME_CHANGED:
      return playerEvents.onPlayerNameChanged(evt.payload.player, evt.payload.previousName);
    case EventType.PLAYER_UPDATED:
      return playerEvents.onPlayerUpdated(evt.payload.player, evt.payload.snapshot, evt.payload.hasChanged);
    case EventType.PLAYER_HISTORY_IMPORTED:
      return playerEvents.onPlayerImported(evt.payload.playerId);
    case EventType.DELTA_UPDATED:
      return deltaEvents.onDeltaUpdated(evt.payload.delta, evt.payload.isPotentialRecord);
    case EventType.NAME_CHANGE_SUBMITTED:
      return nameChangeEvents.onNameChangeSubmitted(evt.payload.nameChange);
    case EventType.ACHIEVEMENTS_CREATED:
      return achievementEvents.onAchievementsCreated(evt.payload.achievements);
  }
}

export default {
  dispatch
};
