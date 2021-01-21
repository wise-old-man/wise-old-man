import { NextFunction, Request, Response } from 'express';
import * as service from '../services/internal/record.service';
import { extractNumber, extractString } from '../util/http';
import * as pagination from '../util/pagination';

// GET /records/leaderboard
async function leaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    // Search filter query
    const metric = extractString(req.query, { key: 'metric' });
    const period = extractString(req.query, { key: 'period' });
    const playerType = extractString(req.query, { key: 'playerType' });
    const playerBuild = extractString(req.query, { key: 'playerBuild' });
    const country = extractString(req.query, { key: 'country' });
    // Pagination query
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    const filter = { metric, period, playerType, playerBuild, country };
    const paginationConfig = pagination.getPaginationConfig(limit, offset);

    const results = await service.getLeaderboard(filter, paginationConfig);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

export { leaderboard };
