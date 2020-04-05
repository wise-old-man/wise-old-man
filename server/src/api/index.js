require('dotenv').config({ path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env' });

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const api = require('./routing');
const jobs = require('./jobs');
const hooks = require('./hooks');

function init() {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());

  if (process.env.NODE_ENV !== 'test') {
    app.use(
      rateLimit({
        windowMs: 5 * 60 * 1000, // 5 minutes
        max: 200 // limit each IP to 200 requests per windowMs
      })
    );

    jobs.process();
    hooks.register();
  }

  app.use('/api', api);

  return app;
}

module.exports = init();
