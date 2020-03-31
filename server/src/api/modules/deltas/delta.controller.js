const service = require('./delta.service');

async function get(req, res, next) {
  try {
    const { playerId, period } = req.query;

    const delta = period
      ? await service.getDelta(playerId, period)
      : await service.getAllDeltas(playerId);

    res.status(200).json(delta);
  } catch (e) {
    next(e);
  }
}

async function leaderboard(req, res, next) {
  try {
    const { metric, period, playerType } = req.query;

    const results = period
      ? await service.getPeriodLeaderboard(metric, period, playerType)
      : await service.getLeaderboard(metric, playerType);

    res.status(200).json(results);
  } catch (e) {
    next(e);
  }
}

exports.get = get;
exports.leaderboard = leaderboard;
