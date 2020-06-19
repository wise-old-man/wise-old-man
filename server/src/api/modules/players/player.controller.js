const jobs = require('../../jobs');
const playerService = require('./player.service');
const achievementService = require('../achievements/achievement.service');
const competitionService = require('../competitions/competition.service');
const groupService = require('../groups/group.service');
const deltaService = require('../deltas/delta.service');
const snapshotService = require('../snapshots/snapshot.service');
const recordService = require('../records/record.service');

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
    jobs.add('ImportPlayer', { username: player.username });

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
// GET /players/username/:username/achievements
async function achievements(req, res, next) {
  try {
    const { id, username } = req.params;
    const { includeMissing } = req.query;

    const playerId = await getPlayerId(id, username);

    // Get all player achievements (by player id)
    const playerAchievements = await achievementService.getPlayerAchievements(playerId, includeMissing);

    res.json(playerAchievements);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/competitions
// GET /players/username/:username/competitions
async function competitions(req, res, next) {
  try {
    const { id, username } = req.params;

    const playerId = await getPlayerId(id, username);

    // Get all player competitions (by player id)
    const playerCompetitions = await competitionService.getPlayerCompetitions(playerId);

    res.json(playerCompetitions);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/groups
// GET /players/username/:username/groups
async function groups(req, res, next) {
  try {
    const { id, username } = req.params;

    const playerId = await getPlayerId(id, username);

    // Get all player groups (by player id)
    const playerGroups = await groupService.getPlayerGroups(playerId);

    res.json(playerGroups);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/gained
// GET /players/username/:username/gained
async function gained(req, res, next) {
  try {
    const { id, username } = req.params;
    const { period } = req.query;

    const playerId = await getPlayerId(id, username);

    const playerDeltas = period
      ? await deltaService.getPlayerPeriodDeltas(playerId, period)
      : await deltaService.getPlayerDeltas(playerId);

    res.json(playerDeltas);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/records
// GET /players/username/:username/records
async function records(req, res, next) {
  try {
    const { id, username } = req.params;
    const { period, metric } = req.query;

    const playerId = await getPlayerId(id, username);

    // Fetch all player records for the given period and metric
    const playerRecords = await recordService.getPlayerRecords(playerId, period, metric);

    res.json(playerRecords);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/snapshots
// GET /players/username/:username/snapshots
async function snapshots(req, res, next) {
  try {
    const { id, username } = req.params;
    const { period } = req.query;

    const playerId = await getPlayerId(id, username);

    const playerSnapshots = period
      ? await snapshotService.getAllInPeriod(playerId, period)
      : await snapshotService.getAllGrouped(playerId);

    res.json(playerSnapshots);
  } catch (e) {
    next(e);
  }
}

/**
 * To support /username endpoints, we should evaluate wether
 * we can use the id given to us via url param, or we need
 * to find that id by doing a username search.
 */
async function getPlayerId(idParam, usernameParam) {
  if (idParam) {
    return idParam;
  }

  if (usernameParam) {
    const player = await playerService.find(usernameParam);
    if (player) return player.id;
  }

  return null;
}

exports.search = search;
exports.track = track;
exports.assertType = assertType;
exports.assertName = assertName;
exports.importPlayer = importPlayer;
exports.details = details;
exports.achievements = achievements;
exports.competitions = competitions;
exports.groups = groups;
exports.gained = gained;
exports.records = records;
exports.snapshots = snapshots;
