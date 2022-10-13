import { Response, Request, NextFunction } from 'express';
import logger from './logging';

interface ControllerResponse {
  statusCode: number;
  response: any;
}

type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<ControllerResponse>;

/**
 * Abstracts the express-related handling from controller functions
 * so that they only need to throw errors and return a ControllerResponse.
 */
function setupController(controllerFn: ControllerFunction, logErrors = false) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { statusCode, response } = await controllerFn(req, res, next);
      const { method, originalUrl } = req;

      const requestDuration = Date.now() - res.locals.requestStartTime;
      logger.info(`${statusCode} ${method} ${originalUrl} (${requestDuration} ms)`);

      res.status(statusCode || 200).json(response);
    } catch (error) {
      if (logErrors) logger.debug(`Controller Error: ${req.originalUrl}`, error, true);
      next(error);
    }
  };
}

export { ControllerResponse, setupController };
