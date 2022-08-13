import { Request } from 'express';
import * as recordServices from './record.services';
import { getEnum } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';

// GET /records/leaderboard
async function leaderboard(req: Request): Promise<ControllerResponse> {
  const results = await recordServices.findRecordLeaderboards({
    metric: getEnum(req.query.metric),
    period: getEnum(req.query.period),
    country: getEnum(req.query.country),
    playerType: getEnum(req.query.playerType),
    playerBuild: getEnum(req.query.playerBuild)
  });

  return { statusCode: 200, response: results };
}

export { leaderboard };
