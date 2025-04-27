import EventEmitter from 'events';
import logger from '../../api/util/logging';
import prometheus from '../services/external/prometheus.service';
import * as NameChangeCreated from './handlers/name-change-created.event';
import * as PlayerDeltaUpdated from './handlers/player-delta-updated.event';
import * as PlayerUpdated from './handlers/player-updated.event';
import type { EventPayloadMap } from './types/event-payload.type';
import { EventType } from './types/event-type.enum';

export class TypedEventEmitter extends EventEmitter {
  emit<K extends keyof EventPayloadMap>(event: K, data: EventPayloadMap[K]): boolean {
    prometheus.trackEventEmitted(event);
    logger.info(`[Event] ${event}`, data, true);
    return super.emit(event, data);
  }

  on<K extends keyof EventPayloadMap>(event: K, listener: (data: EventPayloadMap[K]) => void): this {
    return super.on(event, listener);
  }

  init() {
    this.removeAllListeners();

    this.on(EventType.NAME_CHANGE_CREATED, NameChangeCreated.handler);
    this.on(EventType.PLAYER_DELTA_UPDATED, PlayerDeltaUpdated.handler);
    this.on(EventType.PLAYER_UPDATED, PlayerUpdated.handler);

    return this;
  }
}
