import { AsyncResult, errored } from '@attio/fetchable';
import { sleep } from './sleep.util';

const DEFAULT_MAX_ATTEMPTS = 3;

type RetryOptions = {
  backoff?: number;
  maxAttempts?: number;
};

export async function retry<TValue, TError>(
  retryFn: (attemptIndex: number) => AsyncResult<TValue, TError>,
  options?: RetryOptions,
  /**
   * Should not be used by outside code, only for internal recursion.
   */
  internalAttemptsLeft?: number
): AsyncResult<TValue, TError | { code: 'FAILED_ALL_RETRIES'; subError: unknown }> {
  const maxAttempts = options?.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const attemptsLeft = internalAttemptsLeft ?? maxAttempts;

  try {
    return await retryFn(maxAttempts - attemptsLeft);
  } catch (e) {
    if (attemptsLeft <= 1) {
      return errored({ code: 'FAILED_ALL_RETRIES', subError: e } as const);
    }

    if (options?.backoff) {
      await sleep(options.backoff);
    }

    return retry(retryFn, options, attemptsLeft - 1);
  }
}
