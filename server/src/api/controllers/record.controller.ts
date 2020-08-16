import * as service from '../services/internal/record.service';

// GET /records/leaderboard
async function leaderboard(req, res, next) {
  try {
    const { metric, period, playerType, playerBuild } = req.query;

    const result = await service.getLeaderboard(metric, period, playerType, playerBuild);

    res.json(result);
  } catch (e) {
    next(e);
  }
}

export { leaderboard };
