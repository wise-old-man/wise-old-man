import api from './api';
import { eventEmitter } from './api/events';
import logger from './api/util/logging';
import { getThreadIndex } from './env';
import { jobManager } from './jobs';
import prometheusService from './services/prometheus.service';
import { redisClient } from './services/redis.service';

(async () => {
  eventEmitter.init();

  const port = process.env.API_PORT || 5000;

  const server = api.express.listen(port, () => {
    const version = process.env.npm_package_version;
    logger.info(`v${version}: Server running on port ${port}. Thread Index: ${getThreadIndex()}`);
  });

  let isShuttingDown = false;

  async function handleShutdown() {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.info('Shutting down gracefully...');

    try {
      prometheusService.shutdown();
      await new Promise(res => server.close(res));
      await jobManager.shutdown();
      await redisClient.quit();

      logger.info('Shutdown complete.');
      process.exit(0);
    } catch (err) {
      logger.error('Error during shutdown:', err, true);
      process.exit(1);
    }
  }

  process.on('SIGTERM', () => handleShutdown());
  process.on('SIGINT', () => handleShutdown());

  process.on('exit', code => {
    logger.info(`Process exiting with code ${code}`);
  });

  process.on('unhandledRejection', reason => {
    logger.error('Unhandled Rejection:', reason, true);
    handleShutdown();
  });

  process.on('uncaughtException', error => {
    logger.error('Uncaught Exception:', error, true);
    handleShutdown();
  });

  prometheusService.init();
  await jobManager.init();
})();
