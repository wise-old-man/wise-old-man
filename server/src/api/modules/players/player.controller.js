const jobs = require('../../jobs');
const playerService = require('./player.service');
const achievementService = require('../achievements/achievement.service');
const competitionService = require('../competitions/competition.service');
const deltaService = require('../deltas/delta.service');
const snapshotService = require('../snapshots/snapshot.service');

// GET /players/search?username={username}
async function search(req, res, next) {
  try {
    const { username } = req.query;

    // Search for players with a partial username match
    const players = await playerService.search(username);

    res.json(players);
  } catch (e) {
    next(e);
  }
}

// POST /players/track/
async function track(req, res, next) {
  try {
    const { username } = req.body;

    // Update the player, by creating a new snapshot
    const [player, isNew] = await playerService.update(username);

    // Run secondary job
    jobs.add('ImportPlayer', { player });

    res.status(isNew ? 201 : 200).json(player);
  } catch (e) {
    next(e);
  }
}

// POST /players/assert-type
async function assertType(req, res, next) {
  try {
    const { username } = req.body;

    // (Forcefully) Assert the player's account type
    const type = await playerService.assertType(username, true);

    res.json({ type });
  } catch (e) {
    next(e);
  }
}

// POST /players/assert-name
async function assertName(req, res, next) {
  try {
    const { username } = req.body;

    // Assert the player's displayName (via hiscores lookup)
    const name = await playerService.assertName(username);

    res.json({ displayName: name });
  } catch (e) {
    next(e);
  }
}

// POST /players/import
async function importPlayer(req, res, next) {
  try {
    const { username } = req.body;

    // Attempt to import the player's history from CML
    const history = await playerService.importCML(username);

    res.json({ message: `${history.length} snapshots imported from CML` });
  } catch (e) {
    next(e);
  }
}

// GET /players/:id
// GET /players/username/:username
async function details(req, res, next) {
  try {
    const { id, username } = req.params;

    // Get player details, by id or username
    const player = username
      ? await playerService.getDetails(username)
      : await playerService.getDetailsById(id);

    res.json(player);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/achievements
async function achievements(req, res, next) {
  try {
    const { id } = req.params;
    const { includeMissing } = req.query;

    // Get all player achievements (by player id)
    const playerAchievements = await achievementService.getPlayerAchievements(id, includeMissing);

    res.json(playerAchievements);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/competitions
async function competitions(req, res, next) {
  try {
    const { id } = req.params;

    // Get all player competitions (by player id)
    const playerCompetitions = await competitionService.getPlayerCompetitions(id);

    res.json(playerCompetitions);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/gained
async function gained(req, res, next) {
  try {
    const { id } = req.params;
    const { period } = req.query;

    const playerDeltas = period
      ? await deltaService.getPlayerPeriodDeltas(id, period)
      : await deltaService.getPlayerDeltas(id);

    res.json(playerDeltas);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/snapshots
async function snapshots(req, res, next) {
  try {
    const { id } = req.params;
    const { period } = req.query;

    const playerSnapshots = period
      ? await snapshotService.getAllInPeriod(id, period)
      : await snapshotService.getAllGrouped(id);

    res.json(playerSnapshots);
  } catch (e) {
    next(e);
  }
}

exports.search = search;
exports.track = track;
exports.assertType = assertType;
exports.assertName = assertName;
exports.importPlayer = importPlayer;
exports.details = details;
exports.achievements = achievements;
exports.competitions = competitions;
exports.gained = gained;
exports.snapshots = snapshots;
