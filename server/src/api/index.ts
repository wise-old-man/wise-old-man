import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { router } from './routing';
import { setupJobs } from './jobs';
import * as hooks from './hooks';
import * as proxies from './proxies';

dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const RATE_LIMIT_MINUTES = 5;
const RATE_LIMIT_REQUESTS = 500;

const api = express();

api.use(express.json());
api.use(express.urlencoded({ extended: true }));
api.use(cors());

if (process.env.NODE_ENV !== 'test') {
  api.set('trust proxy', 1);

  // Limits 500 requests per ip, every 5 minutes
  api.use(rateLimit({ windowMs: RATE_LIMIT_MINUTES * 60 * 1000, max: RATE_LIMIT_REQUESTS }));

  setupJobs();
  hooks.setup();
  proxies.setup();
}

api.use('/api', router);

export { api };
