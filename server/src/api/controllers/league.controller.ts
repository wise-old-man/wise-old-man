import { NextFunction, Request, Response } from 'express';
import * as service from '../services/internal/league.service';

// GET /league/tiers
async function tiers(req: Request, res: Response, next: NextFunction) {
  try {
    const leagueTiers = await service.getTierRankThresholds();

    res.json(leagueTiers);
  } catch (e) {
    next(e);
  }
}

export { tiers };
