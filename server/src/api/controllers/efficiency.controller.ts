import { NextFunction, Request, Response } from 'express';
import * as service from '../services/internal/efficiency.service';
import { extractNumber, extractString } from '../util/http';
import * as pagination from '../util/pagination';

// GET /efficiency/leaderboard
async function leaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    // Search filter query
    const metric = extractString(req.query, { key: 'metric' });
    const playerType = extractString(req.query, { key: 'playerType' });
    const playerBuild = extractString(req.query, { key: 'playerBuild' });
    // Pagination query
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    const filter = { metric, playerType, playerBuild };
    const paginationConfig = pagination.getPaginationConfig(limit, offset);

    const results = await service.getLeaderboard(filter, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

// GET /efficiency/rates
async function rates(req: Request, res: Response, next: NextFunction) {
  try {
    const metric = extractString(req.query, { key: 'metric' });
    const type = extractString(req.query, { key: 'type' });

    const rates = await service.getRates(metric, type);

    res.json(rates);
  } catch (e) {
    next(e);
  }
}

export { leaderboard, rates };
