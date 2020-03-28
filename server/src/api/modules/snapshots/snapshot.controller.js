const service = require("./snapshot.service");

async function get(req, res, next) {
  try {
    const { playerId, period } = req.query;

    const snapshots = period
      ? await service.findAllInPeriod(playerId, period)
      : await service.findAllGrouped(playerId);

    res.status(200).json(snapshots);
  } catch (e) {
    next(e);
  }
}

exports.get = get;
