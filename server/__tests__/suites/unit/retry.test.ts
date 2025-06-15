import { complete, errored } from '@attio/fetchable';
import { jest } from '@jest/globals';
import { retry } from '../../../src/utils/retry.util';

describe('retry.util.ts', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  it('should return the successful result if the function succeeds on first attempt', async () => {
    const mockFn = jest.fn(async () => {
      return complete(123);
    });

    const result = await retry(mockFn);

    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith(0);
    expect(result).toEqual(complete(123));
  });

  it('should retry if the function throws an error', async () => {
    const mockFn = jest.fn(async (index: number) => {
      if (index === 0) {
        throw new Error('Unexpected error on first attempt');
      }

      return complete(123);
    });

    const result = await retry(mockFn);

    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenNthCalledWith(1, 0);
    expect(mockFn).toHaveBeenNthCalledWith(2, 1);
    expect(result).toEqual(complete(123));
  });

  it('should return error if all retry attempts fail', async () => {
    const unexpectedErrorMock = new Error('Unexpected error');

    const mockFn = jest.fn(async () => {
      throw unexpectedErrorMock;
    });

    const result = await retry(mockFn, { maxAttempts: 5 });

    expect(mockFn).toHaveBeenCalledTimes(5);

    expect(result).toEqual(
      errored({
        code: 'FAILED_ALL_RETRIES',
        subError: unexpectedErrorMock
      })
    );
  });

  it('should only try once if maxAttempts=1', async () => {
    const unexpectedErrorMock = new Error('Unexpected error');

    const mockFn = jest.fn(async () => {
      throw unexpectedErrorMock;
    });

    const result = await retry(mockFn, { maxAttempts: 1 });

    expect(mockFn).toHaveBeenCalledTimes(1);

    expect(result).toEqual(
      errored({
        code: 'FAILED_ALL_RETRIES',
        subError: unexpectedErrorMock
      })
    );
  });

  it('should respect the maxAttempts option', async () => {
    const mockFn = jest.fn(async () => {
      throw new Error();
    });

    await retry(mockFn, { maxAttempts: 5 });

    expect(mockFn).toHaveBeenCalledTimes(5);
  });

  it('should respect the backoff option for delay between retries', async () => {
    const mockFn = jest.fn(async (index: number) => {
      if (index <= 1) {
        throw new Error('Unexpected error on first attempt');
      }

      return complete(123);
    });

    const startTime = Date.now();
    const retryPromise = retry(mockFn, { backoff: 1000 });

    // First attempt is immediate
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenNthCalledWith(1, 0);

    // Await for all pending timers to resolve
    await jest.runAllTimersAsync();

    expect(mockFn).toHaveBeenCalledTimes(3);

    expect(mockFn).toHaveBeenNthCalledWith(2, 1);
    expect(mockFn).toHaveBeenNthCalledWith(3, 2);

    const result = await retryPromise;

    expect(result).toEqual(complete(123));

    // 3 attempts in total, 2 retries with 1000ms backoff
    expect(Date.now() - startTime).toBeGreaterThanOrEqual(2000);
  });

  it('should handle expected errored results without retrying', async () => {
    const mockFn = jest.fn(async () => {
      if (Math.random() < 0.999999999999) {
        return errored({
          code: 'EXPECTED_ERROR'
        });
      }

      return complete(123);
    });

    const result = await retry(mockFn);

    expect(mockFn).toHaveBeenCalledTimes(1);

    expect(result).toEqual(
      errored({
        code: 'EXPECTED_ERROR'
      })
    );
  });
});
