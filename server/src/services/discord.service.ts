import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import { createId as cuid2 } from '@paralleldrive/cuid2';
import axios from 'axios';
import { WebhookClient } from 'discord.js';
import { CompetitionResponse, FlaggedPlayerReviewContextResponse } from '../api/responses';
import { Achievement, Competition, Group, GroupRole, Player } from '../types';
import logger from './logging.service';

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
  OFFENSIVE_NAMES_FOUND = 'OFFENSIVE_NAMES_FOUND',
  PLAYER_FLAGGED_REVIEW = 'PLAYER_FLAGGED_REVIEW',
  POTENTIAL_CREATION_SPAM = 'POTENTIAL_CREATION_SPAM'
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
  [DiscordBotEventType.OFFENSIVE_NAMES_FOUND]: Array<{
    id: number;
    type: string;
    name: string;
    description?: string;
    reason: string;
  }>;
  [DiscordBotEventType.PLAYER_FLAGGED_REVIEW]: {
    player: Player;
    flagContext: FlaggedPlayerReviewContextResponse;
  };
  [DiscordBotEventType.POTENTIAL_CREATION_SPAM]: {
    ipHash: string;
    groups: Array<Group>;
    competitions: Array<Competition>;
  };
};

export async function sendDiscordWebhook({
  content,
  webhookUrl
}: {
  content: string;
  webhookUrl: string | undefined;
}): AsyncResult<
  true,
  | { code: 'NOT_ALLOWED_IN_TEST_ENV' }
  | { code: 'MISSING_WEBHOOK_URL' }
  | { code: 'FAILED_TO_SEND_DISCORD_WEBHOOK'; subError: unknown }
> {
  if (process.env.NODE_ENV === 'test') {
    return errored({ code: 'NOT_ALLOWED_IN_TEST_ENV' });
  }

  if (!webhookUrl) {
    logger.error('Missing Discord Bot API URL.');
    return errored({ code: 'MISSING_WEBHOOK_URL' });
  }

  const webhookClient = new WebhookClient({
    url: webhookUrl
  });

  const requestResult = await fromPromise(
    webhookClient.send({
      content
    })
  );

  if (isErrored(requestResult)) {
    return errored({
      code: 'FAILED_TO_SEND_DISCORD_WEBHOOK',
      subError: requestResult.error
    });
  }

  return complete(true);
}

export async function dispatchDiscordBotEvent<
  T extends DiscordBotEventType,
  TPayload extends DiscordBotEventPayloadMap[T]
>(
  type: T,
  payload: TPayload
): AsyncResult<
  true,
  | { code: 'NOT_ALLOWED_IN_TEST_ENV' }
  | { code: 'MISSING_DISCORD_BOT_API_URL' }
  | { code: 'FAILED_TO_SEND_DISCORD_BOT_EVENT'; subError: unknown }
> {
  if (process.env.NODE_ENV === 'test') {
    return errored({ code: 'NOT_ALLOWED_IN_TEST_ENV' });
  }

  if (!process.env.DISCORD_BOT_API_URL) {
    logger.error('Missing Discord Bot API URL.');
    return errored({ code: 'MISSING_DISCORD_BOT_API_URL' });
  }

  const eventId = cuid2();

  logger.info(`Dispatching Discord Bot Event: ${type} with ID: ${eventId}`, payload);

  const requestResult = await fromPromise(
    axios.post(process.env.DISCORD_BOT_API_URL, {
      eventId,
      type,
      data: payload
    })
  );

  if (isErrored(requestResult)) {
    logger.error(`Failed to send Discord Bot Event: ${type} with ID: ${eventId}`, requestResult.error);

    return errored({
      code: 'FAILED_TO_SEND_DISCORD_BOT_EVENT',
      subError: requestResult.error
    });
  }

  return complete(true);
}
