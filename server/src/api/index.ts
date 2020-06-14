import * as dotenv from 'dotenv';
dotenv.config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });
import * as express from 'express';
import * as cors from 'cors';
import * as rateLimit from 'express-rate-limit';
import { router } from './routing';
import * as jobs from './jobs';
import * as hooks from './hooks';
import * as proxies from './proxies';
import { sequelize } from '../database';

const RATE_LIMIT_MINUTES = 5;
const RATE_LIMIT_REQUESTS = 500;

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV !== 'test') {
  app.set('trust proxy', 1);

  // Limits 500 requests per ip, every 5 minutes
  app.use(rateLimit({ windowMs: RATE_LIMIT_MINUTES * 60 * 1000, max: RATE_LIMIT_REQUESTS }));

  jobs.setup();
  hooks.setup();
  proxies.setup();
}

app.use('/api', router);

export { app };
