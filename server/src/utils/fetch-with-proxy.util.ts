import { z } from 'zod';
import axios from 'axios';
import proxiesService from '../api/services/external/proxies.service';
import { AsyncResult, fromPromise, isErrored, errored, complete } from '@attio/fetchable';

const PROXY_ERROR_RESPONSE_SCHEMA = z.object({
  code: z.literal('ECONNREFUSED')
});

export async function fetchWithProxy<T>(url: string): AsyncResult<
  T,
  | {
      code: 'FAILED_TO_FETCH';
      subError: unknown;
    }
  | {
      code: 'PROXY_ERROR';
      subError: unknown;
    }
> {
  const proxy = proxiesService.getNextProxy();

  const fetchResult = await fromPromise(
    axios({
      url: proxy != null ? url.replace('https', 'http') : url,
      proxy: proxy != null ? proxy : false
    })
  );

  if (isErrored(fetchResult)) {
    if (proxy && PROXY_ERROR_RESPONSE_SCHEMA.safeParse(fetchResult.error).success) {
      return errored({
        code: 'PROXY_ERROR',
        subError: fetchResult.error
      });
    }

    return errored({
      code: 'FAILED_TO_FETCH',
      subError: fetchResult.error
    });
  }

  return complete(fetchResult.value.data);
}
