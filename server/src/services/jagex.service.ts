import { AsyncResult, complete, errored, isComplete, isErrored } from '@attio/fetchable';
import { z } from 'zod';
import prometheus from '../services/prometheus.service';
import { PlayerType } from '../types';
import { fetchWithProxy } from '../utils/fetch-with-proxy.util';
import { retry } from '../utils/retry.util';
import logger from './logging.service';

const RUNEMETRICS_URL = 'https://apps.runescape.com/runemetrics/profile/profile';

export const OSRS_HISCORES_CSV_URLS = {
  [PlayerType.REGULAR]: 'https://services.runescape.com/m=hiscore_oldschool/index_lite.ws',
  [PlayerType.IRONMAN]: 'https://services.runescape.com/m=hiscore_oldschool_ironman/index_lite.ws',
  [PlayerType.HARDCORE]: 'https://services.runescape.com/m=hiscore_oldschool_hardcore_ironman/index_lite.ws',
  [PlayerType.ULTIMATE]: 'https://services.runescape.com/m=hiscore_oldschool_ultimate/index_lite.ws'
};

export const OSRS_HISCORES_SEGMENT = {
  [PlayerType.UNKNOWN]: 'hiscore_oldschool',
  [PlayerType.REGULAR]: 'hiscore_oldschool',
  [PlayerType.IRONMAN]: 'hiscore_oldschool_ironman',
  [PlayerType.HARDCORE]: 'hiscore_oldschool_hardcore_ironman',
  [PlayerType.ULTIMATE]: 'hiscore_oldschool_ultimate'
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
  async function retriedFunction() {
    const url = `${RUNEMETRICS_URL}?user=${username}`;

    const stopTrackingTimer = prometheus.trackJagexServiceRequest();

    const fetchResult = await fetchWithProxy(url);

    stopTrackingTimer({
      service: 'RuneMetrics',
      status: isErrored(fetchResult) ? 0 : 1
    });

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

const HiscoresErrorSchema = z.union([
  z.object({ code: z.literal('HISCORES_USERNAME_NOT_FOUND') }),
  z.object({ code: z.literal('HISCORES_SERVICE_UNAVAILABLE') }),
  z.object({ code: z.literal('HISCORES_UNEXPECTED_ERROR'), subError: z.unknown() })
]);

export type HiscoresError = z.infer<typeof HiscoresErrorSchema>;

export async function fetchHiscoresCSV(
  username: string,
  type: PlayerType = PlayerType.REGULAR
): AsyncResult<string, HiscoresError> {
  async function retriedFunction(): AsyncResult<string, HiscoresError> {
    const hiscoresType = type === PlayerType.UNKNOWN ? PlayerType.REGULAR : type;

    const url = `${OSRS_HISCORES_CSV_URLS[hiscoresType]}?player=${username}`;

    const stopTrackingTimer = prometheus.trackJagexServiceRequest();

    const fetchResult = await fetchWithProxy(url);

    stopTrackingTimer({
      service: 'OSRS Hiscores',
      status: isErrored(fetchResult) ? 0 : 1
    });

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

export async function fetchHiscoresJSON(
  username: string,
  type: PlayerType = PlayerType.REGULAR
): AsyncResult<string, HiscoresError> {
  async function retriedFunction(): AsyncResult<string, HiscoresError> {
    const stopTrackingTimer = prometheus.trackJagexServiceRequest();

    const fetchResult = await fetchWithProxy(
      `https://services.runescape.com/m=${OSRS_HISCORES_SEGMENT[type]}/index_lite.json?player=${username}`
    );

    stopTrackingTimer({
      service: 'OSRS Hiscores (JSON)',
      status: isErrored(fetchResult) ? 0 : 1
    });

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

    if (typeof data !== 'object' || data === null || !('skills' in data)) {
      return errored({ code: 'HISCORES_SERVICE_UNAVAILABLE' } as const);
    }

    return complete(JSON.stringify(data));
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
