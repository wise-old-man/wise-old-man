import * as Sentry from '@sentry/node';
import express from 'express';
import { ZodError } from 'zod';
import logger from '../services/logging.service';
import { BadRequestErrorZ, NotFoundErrorZ } from './errors';
import competitionRouter from './modules/competitions/competition.router';
import deltaRouter from './modules/deltas/delta.router';
import efficiencyRouter from './modules/efficiency/efficiency.router';
import generalRouter from './modules/general/general.router';
import groupRouter from './modules/groups/group.router';
import nameRouter from './modules/name-changes/name-change.router';
import patronRouter from './modules/patrons/patron.router';
import playerRouter from './modules/players/player.router';
import recordRouter from './modules/records/record.router';
import sailingRouter from './modules/sailing.router';

class RoutingHandler {
  router: express.Router;

  constructor() {
    this.router = express.Router();
    this.setupRoutes();
    this.setupFallbacks();
  }

  setupRoutes() {
    this.router.use((_, res, next) => {
      res.locals.requestStartTime = Date.now();
      next();
    });

    // A simple ping/test endpoint
    this.router.get('/', (_req, res) => {
      res.json(process.env.npm_package_version);
    });

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
    this.router.use(sailingRouter);
  }

  setupFallbacks() {
    // Setup Sentry error tracking
    this.router.use(Sentry.Handlers.errorHandler());

    // Handle endpoint not found
    this.router.use((_req, _res, next) => {
      next(new NotFoundErrorZ({ code: 'ENDPOINT_NOT_FOUND' }));
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
        next(
          new BadRequestErrorZ({
            code: 'VALIDATION_ERROR',
            message: zodError?.issues?.[0]?.message
          })
        );
        return;
      }

      next(error);
    });

    // Handle errors
    this.router.use((error, req, res, _) => {
      const { method, query, params, body, originalUrl } = req;

      const statusCode = error.statusCode ?? 500;

      const errorResponse = {
        code: error.code,
        subError: statusCode >= 500 ? undefined : error.subError,
        message: error.message ?? 'Unknown server error.',
        data: error.data
      };

      const requestDuration = Date.now() - res.locals.requestStartTime;

      logger.error(
        `${statusCode} ${method} ${originalUrl} (${requestDuration} ms) - (${errorResponse.code})`,
        {
          request: {
            query,
            params,
            body
          },
          error: {
            ...errorResponse,
            subError: error.subError
          }
        }
      );

      res.status(statusCode).json(errorResponse);
    });
  }
}

export default new RoutingHandler().router;
