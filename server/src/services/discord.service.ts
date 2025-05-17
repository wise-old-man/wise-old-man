import axios from 'axios';
import { WebhookClient } from 'discord.js';
import logger from '../api/util/logging';
import { Achievement, Player } from '../utils';
import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';

export enum DiscordBotEventType {
  MEMBER_ACHIEVEMENTS = 'MEMBER_ACHIEVEMENTS',
  MEMBER_HCIM_DIED = 'MEMBER_HCIM_DIED'
}

type DiscordBotEventPayloadMap = {
  [DiscordBotEventType.MEMBER_ACHIEVEMENTS]: {
    groupId: number;
    player: Player;
    achievements: Achievement[];
  };
  [DiscordBotEventType.MEMBER_HCIM_DIED]: {
    groupId: number;
    player: Player;
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

  const requestResult = await fromPromise(
    axios.post(process.env.DISCORD_BOT_API_URL, {
      type,
      data: payload
    })
  );

  if (isErrored(requestResult)) {
    return errored({
      code: 'FAILED_TO_SEND_DISCORD_BOT_EVENT',
      subError: requestResult.error
    });
  }

  return complete(true);
}
