import { Response, Request, NextFunction } from 'express';

interface ControllerResponse {
  statusCode: number;
  response: any;
}

type ControllerFunction = (req: Request, res: Response, next: NextFunction) => Promise<ControllerResponse>;

/**
 * Abstracts the express-related handling from controller functions
 * so that they only need to throw errors and return a ControllerResponse.
 */
function setupController(controllerFn: ControllerFunction) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { statusCode, response } = await controllerFn(req, res, next);
      res.status(statusCode || 200).json(response);
    } catch (error) {
      next(error);
    }
  };
}

export { ControllerResponse, setupController };
