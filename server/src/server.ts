import APIInstance from './api';
import { eventEmitter } from './api/events';
import { getThreadIndex } from './env';
import { jobManager } from './jobs';
import logger from './services/logging.service';
import prometheusService from './services/prometheus.service';
import { redisClient } from './services/redis.service';
import { handleServerInit } from './utils/handle-server-init.util';

const PORT = process.env.API_PORT || 5000;

handleServerInit(async () => {
  jobManager.initQueues();

  const apiServer = new APIInstance().init().express.listen(PORT, () => {
    const version = process.env.npm_package_version;
    logger.info(`v${version}: API running on port ${PORT}. Thread Index: ${getThreadIndex()}`);
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

    prometheusService.shutdown();

    if (apiServer !== null) {
      await new Promise(res => apiServer.close(res));
    }

    await jobManager.shutdown();
    await redisClient.quit();
  };
});
