require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const cors = require('cors');
const rateLimit = require('express-rate-limit');
const api = require('./routing');
const jobs = require('./jobs');
const hooks = require('./hooks');
const proxies = require('./proxies');

import express from 'express'

const RATE_LIMIT_MINUTES = 5;
const RATE_LIMIT_REQUESTS = 500;

function init() {
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

  app.use('/api', api);

  return app;
}

module.exports = init();
