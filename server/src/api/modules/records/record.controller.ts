import * as service from './record.service';

async function get(req, res, next) {
  try {
    const { playerId, period, metric } = req.query;

    const records = await service.findAll(playerId, period, metric);
    res.json(records);
  } catch (e) {
    next(e);
  }
}

async function leaderboard(req, res, next) {
  try {
    const { metric, period, playerType } = req.query;

    const result = period
      ? await service.getPeriodLeaderboard(metric, period, playerType)
      : await service.getLeaderboard(metric, playerType);

    res.status(200).json(result);
  } catch (e) {
    next(e);
  }
}

export { get, leaderboard };