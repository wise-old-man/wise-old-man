import * as Sentry from '@sentry/node';
import cors from 'cors';
import express, { Express } from 'express';
import userAgent from 'express-useragent';
import { buildCompoundRedisKey, redisClient } from '../services/redis.service';
import prometheus from './../services/prometheus.service';
import router from './routing';
import { RateLimiter } from './util/rate-limiter';
import { getRequestIp, getRequestIpHash } from './util/request';
import { parseUserAgent } from './util/user-agents';

class APIInstance {
  express: Express;
  rateLimiter: RateLimiter;

  constructor() {
    this.express = express();
    this.rateLimiter = new RateLimiter();
  }

  init() {
    this.setupMiddlewares();
    this.setupRouting();

    return this;
  }

  private setupMiddlewares() {
    this.express.use(Sentry.Handlers.requestHandler());
    this.express.use(Sentry.Handlers.tracingHandler());

    this.express.set('trust proxy', 1);

    this.express.use(userAgent.express());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cors());

    // Register each http request for metrics processing
    this.express.use((req, res, next) => {
      // Browsers block sending a custom user agent, so we're sending a custom header in our webapp
      const userAgentHeader = req.get('X-User-Agent') || req.get('User-Agent');
      const userAgent = parseUserAgent(userAgentHeader, req.useragent);

      res.locals.userAgent = userAgent;

      const endTimer = prometheus.trackHttpRequest();

      res.on('finish', () => {
        const route = req.route ? `${req.baseUrl}${req.route.path}` : '*';
        if (route.startsWith('/metrics')) return;

        const status = res.statusCode;
        const method = req.method;

        const origin = res.locals.apiKey ? `${res.locals.apiKey}-${userAgent}` : userAgent;

        endTimer({
          route,
          status,
          method,
          userAgent: origin
        });
      });

      next();
    });

    // Check the API key or IP of the request origin, and consume rate limit points accordingly
    this.express.use(async (req, res, next) => {
      // Ignore rate limits while running tests
      if (process.env.NODE_ENV === 'test') {
        next();
        return;
      }

      const ipHash = getRequestIpHash(req);

      const isBlocked =
        ipHash !== null && (await redisClient.get(buildCompoundRedisKey('api_blocked', ipHash)));

      if (isBlocked) {
        res.status(429).json({
          message: 'You are blocked from making API requests.'
        });
        return;
      }

      const apiKey = req.headers['x-api-key']?.toString();

      let isMasterKey = false;
      let isTrustedOrigin = false;

      if (apiKey) {
        const activeKey = await redisClient.get(buildCompoundRedisKey('api_key', apiKey));

        if (activeKey === null) {
          return res.status(403).json({
            message: 'Invalid API Key. Please check https://docs.wiseoldman.net/api#rate-limits--api-keys'
          });
        }

        if (activeKey === 'true') {
          isMasterKey = true;
        }

        res.locals.apiKey = apiKey;
        isTrustedOrigin = true;
      }

      if (process.env.NODE_ENV === 'development' || isMasterKey) {
        return next();
      }

      const consumerId = apiKey ?? getRequestIp(req);

      if (consumerId === undefined) {
        return res.status(403).json({
          message: 'Invalid consumer ID'
        });
      }

      const { isAllowed, headers } = await this.rateLimiter.consume(
        consumerId,
        isTrustedOrigin ? 'trusted' : 'default'
      );

      res.set(headers);

      if (!isAllowed) {
        return res.status(429).json({
          message: 'Too Many Requests. Please check https://docs.wiseoldman.net/api#rate-limits--api-keys.'
        });
      }

      next();
    });
  }

  private setupRouting() {
    this.express.use('/', router);
  }
}

export default APIInstance;
