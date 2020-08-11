import express from 'express';
import competitionRoutes from 'api/routes/competitions';
import deltaRoutes from 'api/routes/deltas';
import groupRoutes from 'api/routes/groups';
import nameRoutes from 'api/routes/names';
import playerRoutes from 'api/routes/players';
import recordRoutes from 'api/routes/records';
import logger from 'api/services/external/logger.service';
import { NotFoundError } from './errors';
import { metricAbbreviation } from './util/middlewares';

class RoutingHandler {
  router;

  constructor() {
    this.router = express.Router();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupFallbacks();
  }

  setupMiddlewares() {
    // Handle metric abbreviations (tob -> theatre_of_blood)
    this.router.use(metricAbbreviation);
  }

  setupRoutes() {
    // A simple ping/test endpoint
    this.router.get('/', (req, res) => res.json(true));

    // Register all the modules to the router
    this.router.use('/players', playerRoutes);
    this.router.use('/deltas', deltaRoutes);
    this.router.use('/records', recordRoutes);
    this.router.use('/competitions', competitionRoutes);
    this.router.use('/groups', groupRoutes);
    this.router.use('/names', nameRoutes);
  }

  setupFallbacks() {
    // Handle endpoint not found
    this.router.use((req, res, next) => {
      next(new NotFoundError('Endpoint was not found'));
    });

    // Handle errors
    this.router.use((error, req, res, next) => {
      const { query, params, body, originalUrl } = req;
      const { statusCode, message, data } = error;

      logger.error(`Failed endpoint (${originalUrl})`, {
        data: { query, params, body },
        error
      });

      res.status(statusCode || 500).json({ message, data });
    });
  }
}

export default new RoutingHandler().router;
