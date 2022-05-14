import { Request } from 'express';
import { EfficiencyAlgorithmType } from '../modules/efficiency/efficiency.types';
import * as efficiencyUtils from '../modules/efficiency/efficiency.utils';
import * as efficiencyServices from '../modules/efficiency/efficiency.services';

import { ControllerResponse } from '../util/routing';
import { getEnum, getNumber, getString } from '../util/validation';

// GET /efficiency/leaderboard
async function leaderboard(req: Request): Promise<ControllerResponse> {
  const results = await efficiencyServices.findEfficiencyLeaderboards({
    metric: getEnum(req.query.metric),
    country: getString(req.query.country),
    playerType: getEnum(req.query.playerType),
    playerBuild: getEnum(req.query.playerBuild),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// GET /efficiency/rates
async function rates(req: Request): Promise<ControllerResponse> {
  const { metric, type } = req.query;

  const result = efficiencyUtils.getRates(getEnum(metric), getEnum(type));

  if (!result) {
    const acceptedTypes = Object.values(EfficiencyAlgorithmType).join(', ');

    return {
      statusCode: 400,
      response: { message: `Incorrect type: ${type}. Must be one of [${acceptedTypes}]` }
    };
  }

  return { statusCode: 200, response: result };
}

export { leaderboard, rates };
