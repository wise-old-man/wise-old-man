import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';
import { jobManager } from '../jobs';
import logger from '../services/logging.service';
import { redisClient } from '../services/redis.service';
import { handleServerInit } from '../utils/handle-server-init.util';

const BULL_BOARD_PORT = 5100;

handleServerInit('Bull Board Server', async () => {
  if (process.env.ADMIN_PASSWORD === undefined) {
    throw new Error('ADMIN_PASSWORD is not set');
  }

  jobManager.initQueues();

  const expressApp = express();

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/');

  createBullBoard({
    queues: jobManager.getQueues().map(q => new BullMQAdapter(q)),
    serverAdapter
  });

  expressApp.use('/', serverAdapter.getRouter());

  const server = expressApp.listen(BULL_BOARD_PORT, () => {
    const version = process.env.npm_package_version;
    logger.info(`v${version}: Bull Board running on port ${BULL_BOARD_PORT}.`);
  });

  return async () => {
    if (server !== null) {
      await new Promise(res => server.close(res));
    }

    await jobManager.shutdown();
    await redisClient.quit();
  };
});
