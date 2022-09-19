import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import cors from 'cors';
import express, { Express } from 'express';
import rateLimit from 'express-rate-limit';
import userAgent from 'express-useragent';
import env, { isTesting } from '../env';
import { jobManager } from './jobs';
import router from './routing';
import metricsService from './services/external/metrics.service';
import redisService from './services/external/redis.service';

const RATE_LIMIT_MINUTES = 5;
const RATE_LIMIT_REQUESTS = 150;

class API {
  express: Express;

  constructor() {
    this.express = express();

    jobManager.init();

    if (!isTesting()) {
      this.setupServices();
    }

    this.setupMiddlewares();
    this.setupRouting();
  }

  async shutdown() {
    redisService.shutdown();
    await jobManager.shutdown();
  }

  private setupMiddlewares() {
    this.express.use(Sentry.Handlers.requestHandler());
    this.express.use(Sentry.Handlers.tracingHandler());

    this.express.set('trust proxy', 1);

    this.express.use(userAgent.express());
    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cors());

    // Limits 500 requests per ip, every 5 minutes
    if (!isTesting()) {
      this.express.use(
        rateLimit({
          windowMs: RATE_LIMIT_MINUTES * 60 * 1000,
          max: RATE_LIMIT_REQUESTS
        })
      );
    }

    // Register each http request for metrics processing
    this.express.use((req, res, next) => {
      const endTimer = metricsService.trackHttpRequestStarted();

      res.on('finish', () => {
        if (!req.route) return;

        const route = `${req.baseUrl}${req.route.path}`;
        if (route === '/metrics/') return;

        const status = res.statusCode;
        const method = req.method;

        // Browsers block sending a custom user agent, so we're sending a custom header in our webapp
        const userAgentHeader = req.get('X-User-Agent') || req.get('User-Agent');
        const userAgent = metricsService.reduceUserAgent(userAgentHeader, req.useragent);

        metricsService.trackHttpRequestEnded(endTimer, route, status, method, userAgent);
      });

      next();
    });
  }

  private setupRouting() {
    this.express.use('/', router);
  }

  private setupServices() {
    Sentry.init({
      dsn: env.SENTRY_DSN,
      tracesSampleRate: 0.01,
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Tracing.Integrations.Express({ app: this.express })
      ]
    });
  }
}

export default new API();
