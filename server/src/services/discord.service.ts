import { AsyncResult, complete } from '@attio/fetchable';
import { CompetitionResponse, FlaggedPlayerReviewContextResponse, GroupResponse } from '../api/responses';
import { Achievement, GroupRole, Player } from '../types';

export enum DiscordBotEventType {
  // Player-facing Events
  COMPETITION_CREATED = 'COMPETITION_CREATED',
  COMPETITION_ENDED = 'COMPETITION_ENDED',
  COMPETITION_ENDING = 'COMPETITION_ENDING',
  COMPETITION_STARTED = 'COMPETITION_STARTED',
  COMPETITION_STARTING = 'COMPETITION_STARTING',
  GROUP_MEMBERS_CHANGED_ROLES = 'GROUP_MEMBERS_CHANGED_ROLES',
  GROUP_MEMBERS_JOINED = 'GROUP_MEMBERS_JOINED',
  GROUP_MEMBERS_LEFT = 'GROUP_MEMBERS_LEFT',
  MEMBER_ACHIEVEMENTS = 'MEMBER_ACHIEVEMENTS',
  MEMBER_HCIM_DIED = 'MEMBER_HCIM_DIED',
  MEMBER_NAME_CHANGED = 'MEMBER_NAME_CHANGED',

  // Moderation Events
  PLAYER_FLAGGED_REVIEW = 'PLAYER_FLAGGED_REVIEW',
  CREATION_SPAM_WARNING = 'CREATION_SPAM_WARNING'
}

type DiscordBotEventPayloadMap = {
  [DiscordBotEventType.COMPETITION_CREATED]: {
    groupId: number;
    competition: CompetitionResponse;
  };
  [DiscordBotEventType.COMPETITION_ENDED]: {
    groupId: number;
    competition: CompetitionResponse;
    standings: Array<{
      gained: number;
      displayName: string;
      teamName: string | null;
    }>;
  };
  [DiscordBotEventType.COMPETITION_STARTED]: {
    groupId: number;
    competition: CompetitionResponse;
  };
  [DiscordBotEventType.COMPETITION_STARTING]: {
    groupId: number;
    competition: CompetitionResponse;
    minutesLeft: number;
  };
  [DiscordBotEventType.COMPETITION_ENDING]: {
    groupId: number;
    competition: CompetitionResponse;
    minutesLeft: number;
  };
  [DiscordBotEventType.GROUP_MEMBERS_CHANGED_ROLES]: {
    groupId: number;
    members: Array<{
      player: Pick<Player, 'displayName'>;
      role: GroupRole;
      previousRole: GroupRole;
    }>;
  };
  [DiscordBotEventType.GROUP_MEMBERS_JOINED]: {
    groupId: number;
    members: Array<{
      player: Pick<Player, 'displayName'>;
      role: GroupRole;
    }>;
  };
  [DiscordBotEventType.GROUP_MEMBERS_LEFT]: {
    groupId: number;
    players: Array<Pick<Player, 'displayName'>>;
  };
  [DiscordBotEventType.MEMBER_ACHIEVEMENTS]: {
    groupId: number;
    player: Player;
    achievements: Array<Achievement>;
  };
  [DiscordBotEventType.MEMBER_HCIM_DIED]: {
    groupId: number;
    player: Player;
  };
  [DiscordBotEventType.MEMBER_NAME_CHANGED]: {
    groupId: number;
    player: Player;
    previousName: string;
  };
  [DiscordBotEventType.PLAYER_FLAGGED_REVIEW]: {
    player: Player;
    flagContext: FlaggedPlayerReviewContextResponse;
  };
  [DiscordBotEventType.CREATION_SPAM_WARNING]: {
    creatorIpHash: string;
    type: 'burst-creation-spam' | 'inappropriate-content' | 'protected-players';
    groups: Array<{
      group: GroupResponse;
      reason?: string;
    }>;
    competitions: Array<{
      competition: CompetitionResponse;
      reason?: string;
    }>;
  };
};

export async function sendDiscordWebhook(_args: {
  content: string;
  webhookUrl: string | undefined;
}): AsyncResult<
  true,
  | { code: 'NOT_ALLOWED_IN_TEST_ENV' }
  | { code: 'MISSING_WEBHOOK_URL' }
  | { code: 'FAILED_TO_SEND_DISCORD_WEBHOOK'; subError: unknown }
> {
  // Nope
  return complete(true);
}

export async function dispatchDiscordBotEvent<
  T extends DiscordBotEventType,
  TPayload extends DiscordBotEventPayloadMap[T]
>(
  _type: T,
  _payload: TPayload
): AsyncResult<
  true,
  | { code: 'NOT_ALLOWED_IN_TEST_ENV' }
  | { code: 'MISSING_SERVER_DISCORD_BOT_EVENTS_API_URL' }
  | { code: 'FAILED_TO_SEND_DISCORD_BOT_EVENT'; subError: unknown }
> {
  // Nope
  return complete(true);
}
