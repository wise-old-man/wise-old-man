import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import { isTesting } from '../env';
import * as hooks from './hooks';
import jobs from './jobs';
import * as proxies from './proxies';
import { router } from './routing';

const RATE_LIMIT_MINUTES = 5;
const RATE_LIMIT_REQUESTS = 500;

class API {
  express;

  constructor() {
    this.express = express();

    this.setupMiddlewares();
    this.setupRouting();

    if (!isTesting()) {
      this.setupServices();
    }
  }

  setupMiddlewares() {
    this.express.set('trust proxy', 1);

    this.express.use(express.json());
    this.express.use(express.urlencoded({ extended: true }));
    this.express.use(cors());

    // Limits 500 requests per ip, every 5 minutes
    this.express.use(
      rateLimit({
        windowMs: RATE_LIMIT_MINUTES * 60 * 1000,
        max: RATE_LIMIT_REQUESTS
      })
    );
  }

  setupRouting() {
    this.express.use('/api', router);
  }

  setupServices() {
    jobs.setup();
    hooks.setup();
    proxies.setup();
  }
}

export default new API().express;
