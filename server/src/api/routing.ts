import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';
import express from 'express';
import { getThreadIndex } from '../env';
import { NotFoundError } from './errors';
import competitionRoutes from './modules/competitions/competition.routes';
import deltaRoutes from './modules/deltas/delta.routes';
import efficiencyRoutes from './modules/efficiency/efficiency.routes';
import groupRoutes from './modules/groups/group.routes';
import nameRoutes from './modules/name-changes/name-change.routes';
import playerRoutes from './modules/players/player.routes';
import recordRoutes from './modules/records/record.routes';
import logger from './services/external/logger.service';
import metricsService from './services/external/metrics.service';
import { metricAbbreviation } from './util/middlewares';
class RoutingHandler {
  router: express.Router;

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

    this.router.get('/metrics', async (req, res) => {
      const metrics = await metricsService.getMetrics();
      res.json({ threadIndex: getThreadIndex(), data: metrics });
    });
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

      if (error instanceof ZodError) {
        res.status(400).json({ message: error.issues[0].message });
        return;
      }

      res.status(statusCode || 500).json({ message, data });
    });
  }
}

export default new RoutingHandler().router;
