import { NextFunction, Request, Response } from 'express';
import { BadRequestError, ForbiddenError, ServerError } from '../errors';
import * as adminGuard from '../guards/admin.guard';
import * as achievementServices from '../modules/achievements/achievement.services';
import * as competitionService from '../services/internal/competition.service';
import * as deltaService from '../services/internal/delta.service';
import * as groupService from '../services/internal/group.service';
import * as nameChangeServices from '../modules/name-changes/name-change.services';
import * as playerService from '../services/internal/player.service';
import * as recordService from '../services/internal/record.service';
import * as snapshotService from '../services/internal/snapshot.service';
import { extractDate, extractNumber, extractString } from '../util/http';
import * as pagination from '../util/pagination';

// GET /players/search?username={username}
async function search(req: Request, res: Response, next: NextFunction) {
  try {
    const username = extractString(req.query, { key: 'username', required: true });

    // Search for players with a partial username match
    const players = await playerService.search(username);

    res.json(players);
  } catch (e) {
    next(e);
  }
}

// POST /players/track/
async function track(req: Request, res: Response, next: NextFunction) {
  try {
    const username = extractString(req.body, { key: 'username', required: true });

    if (!username) throw new BadRequestError('Invalid username.');

    // Update the player, by creating a new snapshot
    const [playerDetails, isNew] = await playerService.update(username);

    res.status(isNew ? 201 : 200).json(playerDetails);
  } catch (e) {
    next(e);
  }
}

// POST /players/assert-type
async function assertType(req: Request, res: Response, next: NextFunction) {
  try {
    const username = extractString(req.body, { key: 'username', required: true });

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
async function assertName(req: Request, res: Response, next: NextFunction) {
  try {
    // const username = extractString(req.body, { key: 'username', required: true });

    // // Find the player using the username body param
    // const player = await playerService.resolve({ username });

    // // Assert the player's displayName (via hiscores lookup)
    // const name = await playerService.assertName(player);

    // res.json({ displayName: name });
    throw new ServerError('This feature is currently disabled as Jagex is blocking web scrapers.');
  } catch (e) {
    next(e);
  }
}

// POST /players/import
async function importPlayer(req: Request, res: Response, next: NextFunction) {
  try {
    const username = extractString(req.body, { key: 'username', required: true });

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
async function details(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });

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
async function achievements(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });

    const playerId = await playerService.resolveId({ id, username });

    // Get all player achievements (by player id)
    const achievements = await achievementServices.findPlayerAchievements({ id: playerId });

    if (id && achievements.length === 0) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(achievements);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/achievements/progress
// GET /players/username/:username/achievements/progress
async function achievementsProgress(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });

    const playerId = await playerService.resolveId({ id, username });

    // Get all player achievements (by player id)
    const achievementProgress = await achievementServices.findPlayerAchievementProgress({ id: playerId });

    if (id && achievementProgress.length === 0) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(achievementProgress);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/competitions
// GET /players/username/:username/competitions
async function competitions(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });

    const playerId = await playerService.resolveId({ id, username });

    // Get all player competitions (by player id)
    const playerCompetitions = await competitionService.getPlayerCompetitions(playerId);

    if (id && playerCompetitions.length === 0) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(playerCompetitions);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/groups
// GET /players/username/:username/groups
async function groups(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });
    const limit = extractNumber(req.query, { key: 'limit' });
    const offset = extractNumber(req.query, { key: 'offset' });

    const paginationConfig = pagination.getPaginationConfig(limit, offset);
    const playerId = await playerService.resolveId({ id, username });

    // Get all player groups (by player id)
    const playerGroups = await groupService.getPlayerGroups(playerId, paginationConfig);

    if (id && playerGroups.length === 0) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(playerGroups);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/gained
// GET /players/username/:username/gained
async function gained(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });
    const period = extractString(req.query, { key: 'period' });
    const startDate = extractDate(req.query, { key: 'startDate' });
    const endDate = extractDate(req.query, { key: 'endDate' });

    const playerId = await playerService.resolveId({ id, username });
    let playerDeltas = null;

    if (startDate && endDate) {
      playerDeltas = await deltaService.getPlayerTimeRangeDeltas(playerId, startDate, endDate);
    } else if (period) {
      playerDeltas = await deltaService.getPlayerPeriodDeltas(playerId, period);
    } else {
      playerDeltas = await deltaService.getPlayerDeltas(playerId);
    }

    const hasNoGains = period ? !playerDeltas.startsAt : !playerDeltas['week']?.startsAt;

    if (id && hasNoGains) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(playerDeltas);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/records
// GET /players/username/:username/records
async function records(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });
    const period = extractString(req.query, { key: 'period' });
    const metric = extractString(req.query, { key: 'metric' });

    const playerId = await playerService.resolveId({ id, username });

    // Fetch all player records for the given period and metric
    const playerRecords = await recordService.getPlayerRecords(playerId, { period, metric });

    if (id && playerRecords.length === 0) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(playerRecords);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/snapshots
// GET /players/username/:username/snapshots
async function snapshots(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });
    const period = extractString(req.query, { key: 'period' });
    const startDate = extractDate(req.query, { key: 'startDate', required: !period });
    const endDate = extractDate(req.query, { key: 'endDate', required: !period });

    const playerId = await playerService.resolveId({ id, username });

    const playerSnapshots = period
      ? await snapshotService.getPlayerPeriodSnapshots(playerId, period)
      : await snapshotService.getPlayerTimeRangeSnapshots(playerId, startDate, endDate);

    if (id && playerSnapshots.length === 0) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(playerSnapshots);
  } catch (e) {
    next(e);
  }
}

// GET /players/:id/names
// GET /players/username/:username/names
async function names(req: Request, res: Response, next: NextFunction) {
  try {
    const id = extractNumber(req.params, { key: 'id' });
    const username = extractString(req.params, { key: 'username' });

    const playerId = await playerService.resolveId({ id, username });

    const result = await nameChangeServices.findPlayerNameChanges({ playerId });

    if (id && result.length === 0) {
      // Ensure this player ID exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(result);
  } catch (e) {
    next(e);
  }
}

// PUT /players/username/:username/country
// REQUIRES ADMIN PASSWORD
async function updateCountry(req: Request, res: Response, next: NextFunction) {
  try {
    const username = extractString(req.params, { key: 'username', required: true });
    const country = extractString(req.body, { key: 'country', required: true });

    if (!adminGuard.checkAdminPermissions(req)) {
      throw new ForbiddenError('Incorrect admin password.');
    }

    const player = await playerService.resolve({ username });
    const { code, name } = await playerService.updateCountry(player, country);

    res.json({ message: `Successfully changed country to: ${name} (${code})` });
  } catch (e) {
    next(e);
  }
}

// DELETE /players/username/:username
// REQUIRES ADMIN PASSWORD
async function deletePlayer(req: Request, res: Response, next: NextFunction) {
  try {
    const username = extractString(req.params, { key: 'username', required: true });

    if (!adminGuard.checkAdminPermissions(req)) {
      throw new ForbiddenError('Incorrect admin password.');
    }

    const player = await playerService.resolve({ username });
    await player.destroy();

    res.json({ message: `Successfully deleted player: ${username}` });
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
  achievementsProgress,
  competitions,
  groups,
  gained,
  records,
  snapshots,
  names,
  updateCountry,
  deletePlayer
};
