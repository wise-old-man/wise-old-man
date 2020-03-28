const service = require("./achievement.service");
const { BadRequestError } = require("../../errors");

async function get(req, res, next) {
  try {
    const { playerId, includeMissing } = req.query;

    if (!playerId) {
      throw new BadRequestError("Invalid player id.");
    }

    const achievements = await service.findAll(playerId, includeMissing);
    res.json(achievements);
  } catch (e) {
    next(e);
  }
}

exports.get = get;
