import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import proxiesService from '../api/services/external/proxies.service';
import { AsyncResult, fromPromise, isErrored, errored, complete } from '@attio/fetchable';

const PROXY_ERROR_RESPONSE_SCHEMA = z.object({
  code: z.literal('ECONNREFUSED')
});

export async function fetchWithProxy<T>(url: string): AsyncResult<
  T,
  | {
      code: 'FAILED_TO_FETCH';
      subError: AxiosError;
    }
  | {
      code: 'PROXY_ERROR';
      subError: AxiosError;
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
        subError: fetchResult.error as AxiosError
      });
    }

    return errored({
      code: 'FAILED_TO_FETCH',
      subError: fetchResult.error as AxiosError
    });
  }

  return complete(fetchResult.value.data);
}
