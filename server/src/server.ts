import { getThreadIndex } from './env';
import logger from './api/util/logging';
import { eventEmitter } from './api/events';
import { jobManager } from './jobs';
import api from './api';
import prometheusService from './api/services/external/prometheus.service';
import { redisClient } from './services/redis.service';

(async () => {
  eventEmitter.init();

  const port = process.env.API_PORT || 5000;

  const server = api.express.listen(port, () => {
    const version = process.env.npm_package_version;
    logger.info(`v${version}: Server running on port ${port}. Thread Index: ${getThreadIndex()}`);
  });

  function handleShutdown() {
    prometheusService.shutdown();
    server.close();
    redisClient.quit();
    jobManager.shutdown();
  }

  process.on('SIGTERM', handleShutdown);
  process.on('SIGINT', handleShutdown);
  process.on('exit', handleShutdown);

  prometheusService.init();
  await jobManager.init();
})();
