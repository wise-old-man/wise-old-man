import * as Sentry from '@sentry/node';
import express from 'express';
import { ZodError } from 'zod';
import { getThreadIndex } from '../env';
import { BadRequestError, NotFoundError } from './errors';
import competitionRouter from './modules/competitions/competition.router';
import deltaRouter from './modules/deltas/delta.router';
import efficiencyRouter from './modules/efficiency/efficiency.router';
import generalRouter from './modules/general/general.router';
import groupRouter from './modules/groups/group.router';
import nameRouter from './modules/name-changes/name-change.router';
import patronRouter from './modules/patrons/patron.router';
import playerRouter from './modules/players/player.router';
import recordRouter from './modules/records/record.router';
import prometheus from './services/external/prometheus.service';
import logger from './util/logging';
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
    this.router.use((_, res, next) => {
      res.locals.requestStartTime = Date.now();
      next();
    });

    // Handle metric abbreviations (tob -> theatre_of_blood)
    this.router.use(metricAbbreviation);
  }

  setupRoutes() {
    // A simple ping/test endpoint
    this.router.get('/', (_req, res) => res.json(process.env.npm_package_version));

    // Register all the modules to the router
    this.router.use(competitionRouter);
    this.router.use(deltaRouter);
    this.router.use(efficiencyRouter);
    this.router.use(generalRouter);
    this.router.use(groupRouter);
    this.router.use(nameRouter);
    this.router.use(patronRouter);
    this.router.use(playerRouter);
    this.router.use(recordRouter);

    this.router.get('/metrics', async (_req, res) => {
      const metrics = await prometheus.getMetrics();
      res.json({ threadIndex: getThreadIndex(), data: metrics });
    });
  }

  setupFallbacks() {
    // Setup Sentry error tracking
    this.router.use(Sentry.Handlers.errorHandler());

    // Handle endpoint not found
    this.router.use((_req, _res, next) => {
      next(new NotFoundError('Endpoint was not found'));
    });

    // Catch and convert Zod errors to (400) BadRequest errors
    this.router.use((error, _req, _res, next) => {
      if (!error || !Array.isArray(error) || error.length === 0) {
        next(error);
        return;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const zodError = (error[0] as any).errors as ZodError;

      if (zodError instanceof ZodError) {
        next(new BadRequestError(zodError?.issues?.[0]?.message));
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
