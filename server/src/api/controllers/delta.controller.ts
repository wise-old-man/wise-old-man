import * as service from '../services/internal/delta.service';

// GET /deltas/leaderboard
async function leaderboard(req, res, next) {
  try {
    const { metric, period, playerType, playerBuild } = req.query;

    const results = await service.getLeaderboard(metric, period, playerType, playerBuild);

    res.json(results);
  } catch (e) {
    next(e);
  }
}

export { leaderboard };
