import { Metric, Period, PlayerType } from '../../../utils';
import { EventType } from './event-type.enum';

export type EventPayloadMap = {
  [EventType.NAME_CHANGE_CREATED]: {
    nameChangeId: number;
  };
  [EventType.PLAYER_ACHIEVEMENTS_CREATED]: {
    username: string;
    achievements: Array<{
      metric: Metric;
      threshold: number;
    }>;
  };
  [EventType.PLAYER_DELTA_UPDATED]: {
    username: string;
    period: Period;
    periodStartDate: Date;
    isPotentialRecord: boolean;
  };
  [EventType.PLAYER_NAME_CHANGED]: {
    username: string;
    previousDisplayName: string;
  };
  [EventType.PLAYER_TYPE_CHANGED]: {
    username: string;
    previousType: PlayerType;
    newType: PlayerType;
  };
  [EventType.PLAYER_UPDATED]: {
    username: string;
    hasChanged: boolean;
    previousUpdatedAt: Date | null;
  };
};
