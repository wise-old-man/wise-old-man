import { NextFunction, Request, Response } from 'express';
import { getThreadIndex } from '../../env';
import metricsService from '../services/external/metrics.service';

// GET /metrics/
async function index(req: Request, res: Response, next: NextFunction) {
  try {
    const metrics = await metricsService.getMetrics();
    res.json({ threadIndex: getThreadIndex(), data: metrics });
  } catch (e) {
    next(e);
  }
}

export { index };
