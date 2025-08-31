import api from './api';
import { eventEmitter } from './api/events';
import { getThreadIndex } from './env';
import { jobManager } from './jobs';
import logger from './services/logging.service';
import prometheusService from './services/prometheus.service';
import { redisClient } from './services/redis.service';

(async () => {
  const shutdownHandler = await initServer({
    // Experimental for temporary monitoring
    initAPI: true,
    initJobWorkers: true,
    initJobQueues: true,
    initPrometheus: true,
    initEventEmitter: true
  });

  process.on('SIGTERM', () => shutdownHandler());
  process.on('SIGINT', () => shutdownHandler());

  process.on('exit', code => {
    logger.info(`Process exiting with code ${code}`);
  });

  process.on('unhandledRejection', reason => {
    logger.error('Unhandled Rejection:', reason, true);
    shutdownHandler();
  });

  process.on('uncaughtException', error => {
    logger.error('Uncaught Exception:', error, true);
    shutdownHandler();
  });
})();

async function initServer({
  initAPI,
  initJobWorkers,
  initJobQueues,
  initEventEmitter,
  initPrometheus
}: {
  initAPI: boolean;
  initJobWorkers: boolean;
  initJobQueues: boolean;
  initEventEmitter: boolean;
  initPrometheus: boolean;
}) {
  setInterval(() => {
    console.log('Heart beat');
  }, 180_000);

  if (initEventEmitter) {
    eventEmitter.init();
  }

  const port = process.env.API_PORT || 5000;

  const apiServer = initAPI
    ? api.express.listen(port, () => {
        const version = process.env.npm_package_version;
        logger.info(`v${version}: API running on port ${port}. Thread Index: ${getThreadIndex()}`);
      })
    : null;

  if (initPrometheus) {
    prometheusService.init();
  }

  if (initJobQueues) {
    await jobManager.init({
      initWorkers: initJobWorkers
    });
  }

  let isShuttingDown = false;

  return async () => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.info('Shutting down gracefully...');

    try {
      if (initPrometheus) {
        prometheusService.shutdown();
      }

      if (apiServer !== null) {
        await new Promise(res => apiServer.close(res));
      }

      if (initJobQueues) {
        await jobManager.shutdown();
      }

      await redisClient.quit();

      logger.info('Shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err, true);
      process.exit(1);
    }
  };
}
