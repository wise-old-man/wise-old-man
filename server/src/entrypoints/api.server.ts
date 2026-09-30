/**
 * Import this first so that dotenv is loaded before anything else.
 */
import { getThreadIndex } from '../env';

import * as Sentry from '@sentry/node';
import * as Tracing from '@sentry/tracing';
import APIInstance from '../api';
import { eventEmitter } from '../api/events';
import { jobManager } from '../jobs';
import { logger } from '../services/logger.service';
import prometheusService from '../services/prometheus.service';
import { redisClient } from '../services/redis.service';
import { handleServerInit } from '../utils/handle-server-init.util';

const PORT = process.env.SERVER_API_PORT || 5000;

handleServerInit('API Server', async () => {
  jobManager.initQueues();

  const apiInstance = new APIInstance().init();

  Sentry.init({
    dsn: process.env.SERVER_SENTRY_DSN,
    tracesSampleRate: 0.01,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app: apiInstance.express })
    ]
  });

  const apiServer = apiInstance.express.listen(PORT, () => {
    const version = process.env.npm_package_version;
    logger.info(`v${version}: API running on port ${PORT}. Thread Index: ${getThreadIndex()}`);
  });

  prometheusService.init();
  eventEmitter.init();

  return async () => {
    if (apiServer !== null) {
      await new Promise(res => apiServer.close(res));
    }

    prometheusService.shutdown();

    await jobManager.shutdown();
    await redisClient.quit();
  };
});
