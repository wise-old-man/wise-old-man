import { ZodError } from 'zod';
import * as Sentry from '@sentry/node';
import express from 'express';
import { getThreadIndex } from '../env';
import { BadRequestError, NotFoundError } from './errors';
import logger from './util/logging';
import { metricAbbreviation } from './util/middlewares';
import competitionRoutes from './modules/competitions/competition.routes';
import deltaRouter from './modules/deltas/delta.router';
import generalRouter from './modules/general/general.router';
import efficiencyRouter from './modules/efficiency/efficiency.router';
import groupRoutes from './modules/groups/group.routes';
import nameRoutes from './modules/name-changes/name-change.routes';
import playerRoutes from './modules/players/player.routes';
import patronRoutes from './modules/patrons/patron.routes';
import metricsService from './services/external/metrics.service';
import recordRouter from './modules/records/record.router';

class RoutingHandler {
  router: express.Router;

  constructor() {
    this.router = express.Router();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupFallbacks();
  }

  setupMiddlewares() {
    this.router.use((_, res, next) => {
      res.locals.requestStartTime = Date.now();
      next();
    });

    // Handle metric abbreviations (tob -> theatre_of_blood)
    this.router.use(metricAbbreviation);
  }

  setupRoutes() {
    // A simple ping/test endpoint
    this.router.get('/', (req, res) => res.json(true));

    // Register all the modules to the router
    this.router.use(generalRouter);
    this.router.use(deltaRouter);
    this.router.use(recordRouter);
    this.router.use(efficiencyRouter);

    this.router.use('/players', playerRoutes);
    this.router.use('/competitions', competitionRoutes);
    this.router.use('/groups', groupRoutes);
    this.router.use('/names', nameRoutes);
    this.router.use('/patrons', patronRoutes);

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

    // Handle zod errors
    this.router.use((error, req, res, next) => {
      if (error instanceof ZodError) {
        next(new BadRequestError(error.issues[0].message));
        return;
      }

      if (error && error.length > 0 && error[0].errors instanceof ZodError) {
        next(new BadRequestError(error[0].errors.issues[0].message));
        return;
      }

      next(error);
    });

    // Handle errors
    this.router.use((error, req, res, _) => {
      const { method, query, params, body, originalUrl } = req;

      const message = error.statusCode ? error.message : 'Unknown server error.';
      const statusCode = error.statusCode || 500;

      const requestDuration = Date.now() - res.locals.requestStartTime;

      logger.error(`${statusCode} ${method} ${originalUrl} (${requestDuration} ms) - (${error.message})`, {
        error: error.data,
        query,
        params,
        body
      });

      res.status(statusCode).json({ message, data: error.data });
    });
  }
}

export default new RoutingHandler().router;
