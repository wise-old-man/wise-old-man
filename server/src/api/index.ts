import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import cors from 'cors';
import express, { Express } from 'express';
import userAgent from 'express-useragent';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import jobManager from '../jobs/job.manager';
import router from './routing';
import { parseUserAgent } from './util/user-agents';
import prometheus from './services/external/prometheus.service';
import redisService from './services/external/redis.service';

const RATE_LIMIT_MAX_REQUESTS = 20;
const RATE_LIMIT_DURATION_SECONDS = 60;

// Trusted developers are allowed 5x more requests per minute
const RATE_LIMIT_TRUSTED_RATIO = 5;

const rateLimiter = new RateLimiterRedis({
  points: RATE_LIMIT_MAX_REQUESTS * RATE_LIMIT_TRUSTED_RATIO,
  duration: RATE_LIMIT_DURATION_SECONDS,
  storeClient: redisService.redisClient
});

class API {
  express: Express;

  constructor() {
    this.express = express();

    jobManager.init();

    if (process.env.NODE_ENV !== 'test') {
      this.setupServices();
    }

    this.setupMiddlewares();
    this.setupRouting();

    // TODO: make this not so hacky
    // Shortly after the server has finished starting up, schedule some server-init jobs
    setTimeout(() => {
      jobManager.add('CheckMissingComputedTablesJob');
    }, 5000);
  }

  async shutdown() {
    await jobManager.shutdown();
    redisService.shutdown();
  }

  private setupMiddlewares() {
    this.express.use(Sentry.Handlers.requestHandler());
    this.express.use(Sentry.Handlers.tracingHandler());

    this.express.set('trust proxy', 1);

    this.express.use(userAgent.express());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cors());

    // Check the API key or IP of the request origin, and consume rate limit points accordingly
    this.express.use(async (req, res, next) => {
      // Ignore rate limits while running tests
      if (process.env.NODE_ENV === 'test') {
        next();
        return;
      }

      const apiKey = req.headers['x-api-key']?.toString();

      let isMasterKey = false;
      let isTrustedOrigin = false;

      if (apiKey) {
        const activeKey = await redisService.getValue('api-key', apiKey);

        if (activeKey === null) {
          return res.status(403).json({
            message: 'Invalid API Key. Please check https://docs.wiseoldman.net/#rate-limits--api-keys'
          });
        }

        if (activeKey === 'true') {
          isMasterKey = true;
        }

        res.locals.apiKey = apiKey;
        isTrustedOrigin = true;
      }

      rateLimiter
        .consume(apiKey ?? req.ip, isMasterKey ? 0 : isTrustedOrigin ? 1 : RATE_LIMIT_TRUSTED_RATIO)
        .then(() => next())
        .catch(() =>
          res.status(429).json({
            message: 'Too Many Requests. Please check https://docs.wiseoldman.net/#rate-limits--api-keys.'
          })
        );
    });

    // Register each http request for metrics processing
    this.express.use((req, res, next) => {
      // Browsers block sending a custom user agent, so we're sending a custom header in our webapp
      const userAgentHeader = req.get('X-User-Agent') || req.get('User-Agent');
      const userAgent = parseUserAgent(userAgentHeader, req.useragent);

      res.locals.userAgent = userAgent;

      const endTimer = prometheus.trackHttpRequestStarted();

      res.on('finish', () => {
        if (!req.route) return;

        const route = `${req.baseUrl}${req.route.path}`;
        if (route === '/metrics/') return;

        const status = res.statusCode;
        const method = req.method;

        const origin = res.locals.apiKey ? `${res.locals.apiKey}-${userAgent}` : userAgent;

        prometheus.trackHttpRequestEnded(endTimer, route, status, method, origin);
      });

      next();
    });
  }

  private setupRouting() {
    this.express.use('/', router);
  }

  private setupServices() {
    Sentry.init({
      dsn: process.env.API_SENTRY_DSN,
      tracesSampleRate: 0.01,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app: this.express })
      ]
    });
  }
}

export default new API();
