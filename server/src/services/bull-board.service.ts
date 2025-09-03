import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { Queue } from 'bullmq';
import { Express } from 'express';
import basicAuth from 'express-basic-auth';
import logger from './logging.service';

const BULL_BOARD_BASE_PATH = '/admin/queues';

function init(expressApp: Express, queues: Queue[]) {
  if (process.env.ADMIN_PASSWORD === undefined) {
    return;
  }

  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath(BULL_BOARD_BASE_PATH);

  createBullBoard({
    queues: queues.map(q => new BullMQAdapter(q)),
    serverAdapter
  });

  const authMiddleware = basicAuth({
    users: { admin: process.env.ADMIN_PASSWORD },
    challenge: true
  });

  expressApp.use(BULL_BOARD_BASE_PATH, authMiddleware, serverAdapter.getRouter());

  logger.info(`Queues Dashboard is available at ${BULL_BOARD_BASE_PATH}`);
}

export default { init };
