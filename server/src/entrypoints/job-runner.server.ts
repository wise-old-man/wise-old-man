import { eventEmitter } from '../api/events';
import { jobManager } from '../jobs';
import prometheusService from '../services/prometheus.service';
import { redisClient } from '../services/redis.service';
import { handleServerInit } from '../utils/handle-server-init.util';

handleServerInit('Job Runner Server', async () => {
  jobManager.initQueues();

  prometheusService.init();
  eventEmitter.init();

  await jobManager.initWorkers();

  return async () => {
    await jobManager.shutdown();
    await redisClient.quit();

    prometheusService.shutdown();
  };
});
