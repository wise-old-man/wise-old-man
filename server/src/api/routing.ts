import * as Sentry from '@sentry/node';
import express from 'express';
import { NotFoundError } from './errors';
import competitionRoutes from './routes/competition.routes';
import deltaRoutes from './routes/delta.routes';
import efficiencyRoutes from './routes/efficiency.routes';
import groupRoutes from './routes/group.routes';
import nameRoutes from './routes/name.routes';
import playerRoutes from './routes/player.routes';
import recordRoutes from './routes/record.routes';
import logger from './services/external/logger.service';
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
    this.router.use('/efficiency', efficiencyRoutes);
  }

  setupFallbacks() {
    // Setup Sentry error tracking
    this.router.use(Sentry.Handlers.errorHandler());

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
