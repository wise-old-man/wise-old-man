import { Options, RequestValidation, processRequest } from 'zod-express';
import { RequestHandler } from 'express';
import logger from './logging';

export function executeRequest<TParams, TQuery, TBody>(fn: RequestHandler<TParams, unknown, TBody, TQuery>) {
  return async (
    req: Parameters<typeof fn>[0],
    res: Parameters<typeof fn>[1],
    next: Parameters<typeof fn>[2]
  ) => {
    try {
      const { method, originalUrl } = req;

      await fn(req, res, next);

      const requestDuration = Date.now() - res.locals.requestStartTime;
      logger.info(`${res.statusCode} ${method} ${originalUrl} (${requestDuration} ms)`);
    } catch (error) {
      next(error);
    }
  };
}

export function validateRequest<TParams = unknown, TQuery = unknown, TBody = unknown>(
  schemas: RequestValidation<TParams, TQuery, TBody>,
  options?: Options
): RequestHandler<TParams, unknown, TBody, TQuery> {
  return processRequest(schemas, { ...options, passErrorToNext: true });
}
