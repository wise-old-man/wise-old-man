import * as service from 'api/services/internal/delta.service';

// GET /deltas/leaderboard
async function leaderboard(req, res, next) {
  try {
    const { metric, period, playerType } = req.query;

    const results = period
      ? await service.getPeriodLeaderboard(metric, period, playerType)
      : await service.getLeaderboard(metric, playerType);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

export { leaderboard };
