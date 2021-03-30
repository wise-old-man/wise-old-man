import { NextFunction, Request, Response } from 'express';
import metricsService from '../services/external/metrics.service';

// GET /metrics/
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await metricsService.getMetrics();
    res.json(metrics);
  } catch (e) {
    next(e);
  }
}

export { index };
