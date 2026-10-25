import * as Sentry from '@sentry/node';
import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { logger } from '../../services/logger.service';
import { redisClient } from '../../services/redis.service';

const MINUTE = 60;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

type RateLimitTier = 'default' | 'trusted';

interface RateLimitWindow {
  points: number;
  duration: number;
  keyPrefix: string;
}

// Registered Developer API Keys are allowed 5x more requests per minute, a higher daily limit, and no hourly limit
const TIER_WINDOWS: Record<RateLimitTier, RateLimitWindow[]> = {
  default: [
    { points: 20, duration: MINUTE, keyPrefix: 'rl:default:minute' },
    { points: 500, duration: HOUR, keyPrefix: 'rl:default:hour' },
    { points: 3000, duration: DAY, keyPrefix: 'rl:default:day' }
  ],
  trusted: [
    { points: 100, duration: MINUTE, keyPrefix: 'rl:trusted:minute' },
    { points: 20_000, duration: DAY, keyPrefix: 'rl:trusted:day' }
  ]
};

export interface RateLimitResult {
  isAllowed: boolean;
  headers: Record<string, number>;
}

export class RateLimiter {
  private limiters: Record<RateLimitTier, RateLimiterRedis[]>;

  constructor() {
    this.limiters = {
      default: TIER_WINDOWS.default.map(window => this.createLimiter(window)),
      trusted: TIER_WINDOWS.trusted.map(window => this.createLimiter(window))
    };
  }

  /**
   * Consumes points from every window (minute, hour, day...) of the given tier.
   * The request is only allowed if none of the windows are exhausted.
   */
  async consume(consumerId: string, tier: RateLimitTier, points = 1): Promise<RateLimitResult> {
    const limiters = this.limiters[tier];

    const results = await Promise.allSettled(
      limiters.map(limiter => {
        return limiter.consume(consumerId, points);
      })
    );

    const allowed: Array<{ limiter: RateLimiterRedis; res: RateLimiterRes }> = [];
    const rejected: Array<{ limiter: RateLimiterRedis; res: RateLimiterRes }> = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];

      if (result.status === 'fulfilled') {
        allowed.push({ limiter: limiters[i], res: result.value });
      } else if (result.reason instanceof RateLimiterRes) {
        rejected.push({ limiter: limiters[i], res: result.reason });
      } else {
        // Redis errors should not block requests, so we just ignore this window
        Sentry.captureException(result.reason);
        logger.error('Error consuming rate limiter points', { error: result.reason });
      }
    }

    if (rejected.length > 0) {
      // Report the window that takes the longest to reset, so that Retry-After is accurate
      const { limiter, res } = rejected.reduce((a, b) => (b.res.msBeforeNext > a.res.msBeforeNext ? b : a));
      const resetSeconds = Math.ceil(res.msBeforeNext / 1000);

      return {
        isAllowed: false,
        headers: {
          'RateLimit-Limit': limiter.points,
          'RateLimit-Remaining': 0,
          'RateLimit-Reset': resetSeconds,
          'Retry-After': resetSeconds
        }
      };
    }

    if (allowed.length === 0) {
      return { isAllowed: true, headers: {} };
    }

    // Report the window closest to being exhausted
    const { limiter, res } = allowed.reduce((a, b) =>
      b.res.remainingPoints < a.res.remainingPoints ? b : a
    );

    return {
      isAllowed: true,
      headers: {
        'RateLimit-Limit': limiter.points,
        'RateLimit-Remaining': res.remainingPoints,
        'RateLimit-Reset': Math.ceil(res.msBeforeNext / 1000)
      }
    };
  }

  private createLimiter(window: RateLimitWindow) {
    return new RateLimiterRedis({
      ...window,
      storeClient: redisClient
    });
  }
}
