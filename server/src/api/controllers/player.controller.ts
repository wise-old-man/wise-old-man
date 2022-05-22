import { Request } from 'express';
import { BadRequestError, ForbiddenError } from '../errors';
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
import * as playerUtils from '../modules/players/player.utils';
import { extractDate, extractNumber, extractString } from '../util/http';
import * as pagination from '../util/pagination';
import { getEnum, getNumber, getString } from '../util/validation';
import { ControllerResponse } from '../util/routing';

// GET /players/search?username={username}
async function search(req: Request): Promise<ControllerResponse> {
  // Search for players with a partial username match
  const results = await playerServices.searchPlayers({
    username: getString(req.query.username),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// POST /players/track/
async function track(req: Request): Promise<ControllerResponse> {
  const username = extractString(req.body, { key: 'username', required: true });

  if (!username) throw new BadRequestError('Invalid username.');

  // Update the player, by creating a new snapshot
  const [playerDetails, isNew] = await playerService.update(username);

  return { statusCode: isNew ? 201 : 200, response: playerDetails };
}

// POST /players/assert-type
async function assertType(req: Request): Promise<ControllerResponse> {
  // Find the player using the username body param
  const player = await playerUtils.resolvePlayer({
    username: getString(req.body.username)
  });

  // (Forcefully) Assert the player's account type
  const [, updatedPlayer] = await playerServices.assertPlayerType(player, true);

  return { statusCode: 200, response: updatedPlayer };
}

// POST /players/import
async function importPlayer(req: Request): Promise<ControllerResponse> {
  // Find the player using the username body param
  const player = await playerUtils.resolvePlayer({
    username: getString(req.body.username)
  });

  const history = await playerServices.importPlayerHistory(player);

  return {
    statusCode: 200,
    response: { message: `${history.length} snapshots imported from CML` }
  };
}

// GET /players/:id
// GET /players/username/:username
async function details(req: Request): Promise<ControllerResponse> {
  // Find the player by either the id or the username
  const player = await playerUtils.resolvePlayer({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  // Fetch the player's details
  const playerDetails = await playerServices.fetchPlayerDetails(player);

  return { statusCode: 200, response: playerDetails };
}

// GET /players/:id/achievements
// GET /players/username/:username/achievements
async function achievements(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  // Get all player achievements (by player id)
  const achievements = await achievementServices.findPlayerAchievements({ id: playerId });

  if (playerId && achievements.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: achievements };
}

// GET /players/:id/achievements/progress
// GET /players/username/:username/achievements/progress
async function achievementsProgress(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  // Get all player achievements (by player id)
  const result = await achievementServices.findPlayerAchievementProgress({ id: playerId });

  if (playerId && result.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: result };
}

// GET /players/:id/competitions
// GET /players/username/:username/competitions
async function competitions(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  // Get all player competitions (by player id)
  const playerCompetitions = await competitionService.getPlayerCompetitions(playerId);

  if (playerId && playerCompetitions.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: playerCompetitions };
}

// GET /players/:id/groups
// GET /players/username/:username/groups
async function groups(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const limit = extractNumber(req.query, { key: 'limit' });
  const offset = extractNumber(req.query, { key: 'offset' });

  const paginationConfig = pagination.getPaginationConfig(limit, offset);

  // Get all player groups (by player id)
  const playerGroups = await groupService.getPlayerGroups(playerId, paginationConfig);

  if (playerId && playerGroups.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: playerGroups };
}

// GET /players/:id/gained
// GET /players/username/:username/gained
async function gained(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const period = extractString(req.query, { key: 'period' });
  const startDate = extractDate(req.query, { key: 'startDate' });
  const endDate = extractDate(req.query, { key: 'endDate' });
  const formatting = extractString(req.query, { key: 'formatting' });

  const results = await deltaServices.findPlayerDeltas({
    id: playerId,
    period,
    minDate: startDate,
    maxDate: endDate,
    formatting: getEnum(formatting)
  });

  return { statusCode: 200, response: results };
}

// GET /players/:id/records
// GET /players/username/:username/records
async function records(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  // Fetch all player records for the given period and metric
  const results = await recordServices.findPlayerRecords({
    id: playerId,
    period: getEnum(req.query.period),
    metric: getEnum(req.query.metric)
  });

  if (playerId && results.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: results };
}

// GET /players/:id/snapshots
// GET /players/username/:username/snapshots
async function snapshots(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const period = extractString(req.query, { key: 'period' });
  const startDate = extractDate(req.query, { key: 'startDate', required: !period });
  const endDate = extractDate(req.query, { key: 'endDate', required: !period });

  const results = await snapshotServices.findPlayerSnapshots({
    id: playerId,
    period,
    minDate: startDate,
    maxDate: endDate
  });

  const formattedSnapshots = results.map(snapshotUtils.format);

  if (playerId && formattedSnapshots.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: formattedSnapshots };
}

// GET /players/:id/names
// GET /players/username/:username/names
async function names(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const result = await nameChangeServices.findPlayerNameChanges({ playerId });

  if (playerId && result.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: result };
}

// PUT /players/username/:username/country
// REQUIRES ADMIN PASSWORD
async function changeCountry(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const updatedPlayer = await playerServices.changePlayerCountry({
    username: getString(req.params.username),
    country: getString(req.body.country)
  });

  return { statusCode: 200, response: updatedPlayer };
}

// DELETE /players/username/:username
// REQUIRES ADMIN PASSWORD
async function deletePlayer(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const deletedPlayer = await playerServices.deletePlayer({
    username: getString(req.params.username)
  });

  return {
    statusCode: 200,
    response: { message: `Successfully deleted player: ${deletedPlayer.displayName}` }
  };
}

export {
  search,
  track,
  assertType,
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
  changeCountry,
  deletePlayer
};
