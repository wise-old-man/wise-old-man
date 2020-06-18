import * as service from './record.service';

// GET /records/leaderboard
async function leaderboard(req, res, next) {
  try {
    const { metric, period, playerType } = req.query;

    const result = period
      ? await service.getPeriodLeaderboard(metric, period, playerType)
      : await service.getLeaderboard(metric, playerType);

    res.json(result);
  } catch (e) {
    next(e);
  }
}

export { leaderboard };
