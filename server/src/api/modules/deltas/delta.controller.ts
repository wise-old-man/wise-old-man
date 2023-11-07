import { Request } from 'express';
import * as deltaServices from './delta.services';
import { getEnum } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';

// GET /deltas/leaderboard
async function leaderboard(req: Request): Promise<ControllerResponse> {
  const results = await deltaServices.findDeltaLeaderboards({
    metric: getEnum(req.query.metric),
    period: getEnum(req.query.period),
    country: getEnum(req.query.country),
    playerBuild: getEnum(req.query.playerBuild)
  });

  return { statusCode: 200, response: results };
}

export { leaderboard };
