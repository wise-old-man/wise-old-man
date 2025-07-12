import { AsyncResult, complete, errored, isComplete, isErrored } from '@attio/fetchable';
import { z } from 'zod';
import prometheus from '../services/prometheus.service';
import { PlayerType } from '../utils';
import { fetchWithProxy } from '../utils/fetch-with-proxy.util';
import { retry } from '../utils/retry.util';
import logger from './logging.service';

const RUNEMETRICS_URL = 'https://apps.runescape.com/runemetrics/profile/profile';

export const OSRS_HISCORES_URLS = {
  [PlayerType.REGULAR]: 'https://services.runescape.com/m=hiscore_oldschool/index_lite.ws',
  [PlayerType.IRONMAN]: 'https://services.runescape.com/m=hiscore_oldschool_ironman/index_lite.ws',
  [PlayerType.HARDCORE]: 'https://services.runescape.com/m=hiscore_oldschool_hardcore_ironman/index_lite.ws',
  [PlayerType.ULTIMATE]: 'https://services.runescape.com/m=hiscore_oldschool_ultimate/index_lite.ws'
};

const RUNEMETRICS_ERROR_RESPONSE_SCHEMA = z.object({
  error: z.string()
});

export async function getRuneMetricsBannedStatus(username: string): AsyncResult<
  { isBanned: boolean },
  {
    code: 'FAILED_TO_LOAD_RUNEMETRICS';
    subError: unknown;
  }
> {
  async function retriedFunction(attemptIndex: number) {
    const url = `${RUNEMETRICS_URL}?user=${username}`;

    logger.debug(`Attempt ${attemptIndex + 1} to fetch RuneMetrics for player: ${username}`);

    const stopTrackingTimer = prometheus.trackRuneMetricsRequest();

    const fetchResult = await fetchWithProxy(url);
    stopTrackingTimer();

    if (isErrored(fetchResult)) {
      // If it's a proxy error, we throw it so that it can be retried with other proxies
      if (fetchResult.error.code === 'PROXY_ERROR') {
        throw fetchResult.error;
      }

      return errored({
        code: 'FAILED_TO_LOAD_RUNEMETRICS',
        subError: fetchResult.error.subError
      } as const);
    }

    const parseResult = RUNEMETRICS_ERROR_RESPONSE_SCHEMA.safeParse(fetchResult.value);
    const isBanned = parseResult.success && parseResult.data.error === 'NOT_A_MEMBER';

    return complete({ isBanned });
  }

  const result = await retry(retriedFunction);

  if (isComplete(result)) {
    return result;
  }

  return errored({
    code: 'FAILED_TO_LOAD_RUNEMETRICS',
    subError: result.error.subError
  } as const);
}

export const HiscoresErrorSchema = z.union([
  z.object({ code: z.literal('HISCORES_USERNAME_NOT_FOUND') }),
  z.object({ code: z.literal('HISCORES_SERVICE_UNAVAILABLE') }),
  z.object({ code: z.literal('HISCORES_UNEXPECTED_ERROR'), subError: z.unknown() })
]);

export type HiscoresError = z.infer<typeof HiscoresErrorSchema>;

export async function fetchHiscoresData(
  username: string,
  type: PlayerType = PlayerType.REGULAR
): AsyncResult<string, HiscoresError> {
  async function retriedFunction(attemptIndex: number): AsyncResult<string, HiscoresError> {
    const hiscoresType = type === PlayerType.UNKNOWN ? PlayerType.REGULAR : type;

    const url = `${OSRS_HISCORES_URLS[hiscoresType]}?player=${username}`;

    logger.debug(`Attempt ${attemptIndex + 1} to fetch Hiscores for player: ${username}`);

    const stopTrackingTimer = prometheus.trackHiscoresRequest();

    const fetchResult = await fetchWithProxy(url);
    stopTrackingTimer();

    if (isErrored(fetchResult)) {
      // If it's a proxy error, we throw it so that it can be retried with other proxies
      if (fetchResult.error.code === 'PROXY_ERROR') {
        throw fetchResult.error;
      }

      const axiosError = fetchResult.error.subError;

      if ('response' in axiosError && axiosError.response?.status === 404) {
        return errored({
          code: 'HISCORES_USERNAME_NOT_FOUND'
        } as const);
      }

      logger.error('Unexpected hiscores error', fetchResult.error);

      return errored({
        code: 'HISCORES_UNEXPECTED_ERROR',
        subError: fetchResult.error.subError
      } as const);
    }

    const data = fetchResult.value;

    if (typeof data !== 'string' || data.length === 0 || data.includes('Unavailable') || data.includes('<')) {
      return errored({
        code: 'HISCORES_SERVICE_UNAVAILABLE'
      } as const);
    }

    return complete(data);
  }

  const result = await retry(retriedFunction);

  if (isComplete(result)) {
    return result;
  }

  const parsedError = HiscoresErrorSchema.safeParse(result.error);

  if (parsedError.success) {
    return errored(parsedError.data);
  }

  return errored({
    code: 'HISCORES_UNEXPECTED_ERROR',
    subError: result.error
  } as const);
}
