import { z } from 'zod';
import { AsyncResult, complete, errored, isErrored } from '@attio/fetchable';
import { fetchWithProxy } from '../utils/fetch-with-proxy.util';
import { retry } from '../utils/retry.util';
import logger from '../api/util/logging';

const RUNEMETRICS_URL = 'https://apps.runescape.com/runemetrics/profile/profile';

const RUNEMETRICS_ERROR_RESPONSE_SCHEMA = z.object({
  error: z.string()
});

export async function getRuneMetricsBannedStatus(
  username: string
): AsyncResult<
  { isBanned: boolean },
  | { code: 'FAILED_TO_LOAD_RUNEMETRICS'; subError: unknown }
  | { code: 'FAILED_ALL_RETRIES'; subError: unknown }
> {
  return retry(async attemptIndex => {
    const url = `${RUNEMETRICS_URL}?user=${username}`;

    logger.debug(`Attempt ${attemptIndex + 1} to fetch RuneMetrics for user: ${username}`);

    const fetchResult = await fetchWithProxy(url);

    if (isErrored(fetchResult)) {
      // If it's a proxy error, we throw it so that it can be retried with other proxies
      if (fetchResult.error.code === 'PROXY_ERROR') {
        throw fetchResult.error;
      }

      return errored({
        code: 'FAILED_TO_LOAD_RUNEMETRICS',
        subError: fetchResult.error.subError
      });
    }

    const parseResult = RUNEMETRICS_ERROR_RESPONSE_SCHEMA.safeParse(fetchResult.value);
    const isBanned = parseResult.success && parseResult.data.error === 'NOT_A_MEMBER';

    return complete({ isBanned });
  });
}
