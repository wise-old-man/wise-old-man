import { Options, RequestValidation, processRequest } from 'zod-express';
import { Response, Request, NextFunction, RequestHandler } from 'express';
import logger from './logging';

interface ControllerResponse {
  statusCode: number;
  response: unknown;
}

interface ControllerOptions {
  logErrors?: boolean;
  returnAsText?: boolean;
}

type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<ControllerResponse>;

/**
 * Abstracts the express-related handling from controller functions
 * so that they only need to throw errors and return a ControllerResponse.
 */
function setupController(controllerFn: ControllerFunction, options?: ControllerOptions) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { statusCode, response } = await controllerFn(req, res, next);
      const { method, originalUrl } = req;

      const requestDuration = Date.now() - res.locals.requestStartTime;
      logger.info(`${statusCode} ${method} ${originalUrl} (${requestDuration} ms)`);

      if (options?.returnAsText) {
        res.end(response);
      } else {
        res.status(statusCode || 200).json(response);
      }
    } catch (error) {
      if (options?.logErrors) {
        logger.debug(`Controller Error: ${req.originalUrl}`, error, true);
      }

      next(error);
    }
  };
}

function validateRequestExtended<TParams = unknown, TQuery = unknown, TBody = unknown>(
  schemas: RequestValidation<TParams, TQuery, TBody>,
  options?: Options
): RequestHandler<TParams, unknown, TBody, TQuery> {
  return processRequest(schemas, { ...options, passErrorToNext: true });
}

export { ControllerResponse, setupController, validateRequestExtended as validateRequest };
