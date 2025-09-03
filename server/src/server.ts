import APIInstance from './api';
import { eventEmitter } from './api/events';
import { getThreadIndex } from './env';
import { jobManager } from './jobs';
import logger from './services/logging.service';
import prometheusService from './services/prometheus.service';
import { redisClient } from './services/redis.service';

(async () => {
  const shutdownHandler = await initServer();

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

async function initServer() {
  const port = process.env.API_PORT || 5000;

  await jobManager.initQueues();

  const apiServer = new APIInstance().init().express.listen(port, () => {
    const version = process.env.npm_package_version;
    logger.info(`v${version}: API running on port ${port}. Thread Index: ${getThreadIndex()}`);
  });

  prometheusService.init();
  eventEmitter.init();

  await jobManager.initWorkers();

  let isShuttingDown = false;

  return async () => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.info('Shutting down gracefully...');

    try {
      prometheusService.shutdown();

      if (apiServer !== null) {
        await new Promise(res => apiServer.close(res));
      }

      await jobManager.shutdown();
      await redisClient.quit();

      logger.info('Shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err, true);
      process.exit(1);
    }
  };
}
