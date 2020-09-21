import * as achievementService from '../services/internal/achievement.service';
import * as competitionService from '../services/internal/competition.service';
import * as deltaService from '../services/internal/delta.service';
import * as groupService from '../services/internal/group.service';
import * as playerService from '../services/internal/player.service';
import * as recordService from '../services/internal/record.service';
import * as snapshotService from '../services/internal/snapshot.service';
import { getCombatLevel } from '../util/level';

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
    const [player, snapshot, isNew] = await playerService.update(username);

    const response = {
      ...player.toJSON(),
      combatLevel: getCombatLevel(snapshot),
      latestSnapshot: snapshotService.format(snapshot)
    };

    res.status(isNew ? 201 : 200).json(response);
  } catch (e) {
    next(e);
  }
}

// POST /players/assert-type
async function assertType(req, res, next) {
  try {
    const { username } = req.body;

    // Find the player using the username body param
    const player = await playerService.resolve({ username });

    // (Forcefully) Assert the player's account type
    const type = await playerService.assertType(player);

    res.json({ type });
  } catch (e) {
    next(e);
  }
}

// POST /players/assert-name
async function assertName(req, res, next) {
  try {
    const { username } = req.body;

    // Find the player using the username body param
    const player = await playerService.resolve({ username });

    // Assert the player's displayName (via hiscores lookup)
    const name = await playerService.assertName(player);

    res.json({ displayName: name });
  } catch (e) {
    next(e);
  }
}

// POST /players/import
async function importPlayer(req, res, next) {
  try {
    const { username } = req.body;

    // Find the player using the username body param
    const player = await playerService.resolve({ username });

    // Attempt to import the player's history from CML
    const history = await playerService.importCML(player);

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

    // Find the player by either the id or the username
    const player = await playerService.resolve({ id, username });

    // Fetch the player's details
    const playerDetails = await playerService.getDetails(player);

    res.json(playerDetails);
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

    const playerId = await playerService.resolveId({ id, username });

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

    const playerId = await playerService.resolveId({ id, username });

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

    const playerId = await playerService.resolveId({ id, username });

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

    const playerId = await playerService.resolveId({ id, username });

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

    const playerId = await playerService.resolveId({ id, username });

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

    const playerId = await playerService.resolveId({ id, username });

    const playerSnapshots = period
      ? await snapshotService.getAllInPeriod(playerId, period)
      : await snapshotService.getAllGrouped(playerId);

    res.json(playerSnapshots);
  } catch (e) {
    next(e);
  }
}

export {
  search,
  track,
  assertType,
  assertName,
  importPlayer,
  details,
  achievements,
  competitions,
  groups,
  gained,
  records,
  snapshots
};
