import { NextFunction, Request, Response } from 'express';
import { Player } from '../../database/models';
import { BadRequestError, ForbiddenError, ServerError } from '../errors';
import * as adminGuard from '../guards/admin.guard';
import * as achievementServices from '../modules/achievements/achievement.services';
import * as competitionService from '../services/internal/competition.service';
import * as groupService from '../services/internal/group.service';
import * as nameChangeServices from '../modules/name-changes/name-change.services';
import * as recordServices from '../modules/records/record.services';
import * as playerServices from '../modules/players/player.services';
import * as playerService from '../services/internal/player.service';
import * as snapshotServices from '../modules/snapshots/snapshot.services';
import * as deltaServices from '../modules/deltas/delta.services';
import * as snapshotUtils from '../modules/snapshots/snapshot.utils';
import { extractDate, extractNumber, extractString } from '../util/http';
import * as pagination from '../util/pagination';
import { getEnum, getNumber, getString } from '../util/validation';

// GET /players/search?username={username}
async function search(req: Request, res: Response, next: NextFunction) {
  try {
    // Search for players with a partial username match
    const results = await playerServices.searchPlayers({
      username: getString(req.query.username),
      limit: getNumber(req.query.limit),
      offset: getNumber(req.query.offset)
    });

    res.json(results);
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

    const history = await playerServices.importPlayerHistory({ username });

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
    const formatting = extractString(req.query, { key: 'formatting' });

    const playerId = await playerService.resolveId({ id, username });

    const results = await deltaServices.findPlayerDeltas({
      id: playerId,
      period,
      minDate: startDate,
      maxDate: endDate,
      formatting: getEnum(formatting)
    });

    res.json(results);
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

    const playerId = await playerService.resolveId({ id, username });

    // Fetch all player records for the given period and metric
    const results = await recordServices.findPlayerRecords({
      id: playerId,
      period: getEnum(req.query.period),
      metric: getEnum(req.query.metric)
    });

    if (id && results.length === 0) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(results);
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

    const results = await snapshotServices.findPlayerSnapshots({
      id: playerId,
      period,
      minDate: startDate,
      maxDate: endDate
    });

    const formattedSnapshots = results.map(snapshotUtils.format);

    if (id && formattedSnapshots.length === 0) {
      // Ensure this player Id exists (if not, it'll throw a 404 error)
      await playerService.resolve({ id });
    }

    res.json(formattedSnapshots);
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
    if (!adminGuard.checkAdminPermissions(req)) {
      throw new ForbiddenError('Incorrect admin password.');
    }

    const updatedPlayer = await playerServices.updatePlayerCountry({
      username: getString(req.params.username),
      country: getString(req.body.country)
    });

    res.json(updatedPlayer);
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

    await Player.destroy({ where: { id: player.id } });

    res.json({ message: `Successfully deleted player: ${player.displayName}` });
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
