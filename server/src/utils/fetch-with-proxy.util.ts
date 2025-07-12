import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import proxyService from '../services/proxy.service';

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
  const proxy = proxyService.getNextProxy();

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
