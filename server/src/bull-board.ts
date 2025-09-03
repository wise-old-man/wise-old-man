import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import express from 'express';
import basicAuth from 'express-basic-auth';
import { jobManager } from './jobs';
import logger from './services/logging.service';
import { redisClient } from './services/redis.service';
import { handleServerInit } from './utils/handle-server-init.util';

const BULL_BOARD_PORT = 5100;

handleServerInit(async () => {
  if (process.env.ADMIN_PASSWORD === undefined) {
    throw new Error('ADMIN_PASSWORD is not set');
  }

  jobManager.initQueues();

  const expressApp = express();

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath("/");

  createBullBoard({
    queues: jobManager.getQueues().map(q => new BullMQAdapter(q)),
    serverAdapter
  });

  const authMiddleware = basicAuth({
    users: { admin: process.env.ADMIN_PASSWORD },
    challenge: true
  });

  expressApp.use("/", authMiddleware, serverAdapter.getRouter());

  const server = expressApp.listen(BULL_BOARD_PORT, () => {
    const version = process.env.npm_package_version;
    logger.info(`v${version}: Bull Board running on port ${BULL_BOARD_PORT}.`);
  });

  let isShuttingDown = false;

  return async () => {
    if (isShuttingDown) {
      return;
    }

    isShuttingDown = true;
    logger.info('Shutting down gracefully...');

    if (server !== null) {
      await new Promise(res => server.close(res));
    }

    await jobManager.shutdown();
    await redisClient.quit();
  };
});
