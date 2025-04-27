import { Period } from '../../../utils';
import { EventType } from './event-type.enum';

export type EventPayloadMap = {
  [EventType.NAME_CHANGE_CREATED]: {
    nameChangeId: number;
  };
  [EventType.PLAYER_DELTA_UPDATED]: {
    username: string;
    period: Period;
    periodStartDate: Date;
    isPotentialRecord: boolean;
  };
  [EventType.PLAYER_UPDATED]: {
    username: string;
    hasChanged: boolean;
    previousUpdatedAt: Date | null;
  };
};
