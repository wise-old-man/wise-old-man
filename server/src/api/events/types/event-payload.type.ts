import { GroupRole, Metric, Period, PlayerType } from '../../../types';
import { FlaggedPlayerReviewContextResponse } from '../../responses';
import { EventType } from './event-type.enum';

export type EventPayloadMap = {
  [EventType.COMPETITION_CREATED]: {
    competitionId: number;
  };
  [EventType.COMPETITION_ENDED]: {
    competitionId: number;
  };
  [EventType.COMPETITION_ENDING]: {
    competitionId: number;
    minutesLeft: number;
  };
  [EventType.COMPETITION_PARTICIPANTS_JOINED]: {
    competitionId: number;
    participants: Array<{
      playerId: number;
    }>;
  };
  [EventType.COMPETITION_STARTED]: {
    competitionId: number;
  };
  [EventType.COMPETITION_STARTING]: {
    competitionId: number;
    minutesLeft: number;
  };
  [EventType.GROUP_CREATED]: {
    groupId: number;
  };
  [EventType.GROUP_MEMBERS_JOINED]: {
    groupId: number;
    members: Array<{
      playerId: number;
      role: GroupRole;
    }>;
  };
  [EventType.GROUP_MEMBERS_LEFT]: {
    groupId: number;
    members: Array<{
      playerId: number;
    }>;
  };
  [EventType.GROUP_MEMBERS_ROLES_CHANGED]: {
    groupId: number;
    members: Array<{
      playerId: number;
      role: GroupRole;
      previousRole: GroupRole;
    }>;
  };
  [EventType.GROUP_UPDATED]: {
    groupId: number;
  };
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
  [EventType.PLAYER_ARCHIVED]: {
    username: string;
    previousUsername: string;
  };
  [EventType.PLAYER_DELTA_UPDATED]: {
    username: string;
    period: Period;
    periodStartDate: Date;
    isPotentialRecord: boolean;
  };
  [EventType.PLAYER_FLAGGED]: {
    username: string;
    context: FlaggedPlayerReviewContextResponse;
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
