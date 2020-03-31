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

  app.use(
    rateLimit({
      windowMs: 5 * 60 * 1000, // 5 minutes
      max: 200 // limit each IP to 200 requests per windowMs
    })
  );

  app.use('/api', api);

  jobs.process();
  hooks.register();

  return app;
}

module.exports = init();
