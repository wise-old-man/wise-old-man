import { Achievement, Player } from '../../../utils';
import axios from 'axios';
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

export async function dispatchDiscordBotEventWebhook<T extends keyof DiscordBotEventPayloadMap>(
  type: T,
  payload: DiscordBotEventPayloadMap[T]
): AsyncResult<
  boolean,
  | { code: 'DISCORD_API_URL_MISSING' }
  | {
      code: 'FAILED_TO_SEND_DISCORD_BOT_EVENT';
      subError: unknown;
    }
> {
  if (process.env.NODE_ENV === 'test') {
    return complete(false);
  }

  if (!process.env.DISCORD_BOT_API_URL) {
    return errored({ code: 'DISCORD_API_URL_MISSING' });
  }

  const postResult = await fromPromise(
    axios.post(process.env.DISCORD_BOT_API_URL, {
      type,
      data: payload
    })
  );

  if (isErrored(postResult)) {
    return errored({
      code: 'FAILED_TO_SEND_DISCORD_BOT_EVENT',
      subError: postResult.error
    });
  }

  return complete(true);
}
