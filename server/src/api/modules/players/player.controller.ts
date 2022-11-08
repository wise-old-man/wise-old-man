import { Request, Response } from 'express';
import { ForbiddenError } from '../../errors';
import * as adminGuard from '../../guards/admin.guard';
import redisService from '../../services/external/redis.service';
import * as achievementServices from '../achievements/achievement.services';
import * as nameChangeServices from '../name-changes/name-change.services';
import * as recordServices from '../records/record.services';
import * as groupServices from '../groups/group.services';
import * as competitionServices from '../competitions/competition.services';
import * as playerServices from './player.services';
import * as snapshotServices from '../snapshots/snapshot.services';
import * as deltaServices from '../deltas/delta.services';
import * as snapshotUtils from '../snapshots/snapshot.utils';
import * as playerUtils from './player.utils';
import { getDate, getEnum, getNumber, getString } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';
import logger from '../../util/logging';

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

// POST /players/:username
async function track(req: Request, res: Response): Promise<ControllerResponse> {
  const userAgent = res.locals.userAgent;

  const { accountHash } = req.body;
  const { username } = req.params;

  // RuneLite requests include an "accountHash" body param that serves as a unique ID per OSRS account.
  // If this ID is linked to a different username than before, that means that account has changed
  // their name and we should automatically submit a name change for it.
  if ((userAgent === 'RuneLite' || userAgent === 'WiseOldMan RuneLite Plugin') && accountHash) {
    const storedUsername = await redisService.getValue('hash', accountHash);

    if (storedUsername && storedUsername !== username) {
      await nameChangeServices
        .submitNameChange({ oldName: storedUsername, newName: username })
        .catch(e => logger.error('Failed to auto-submit name changed from account hash.', e));
    }

    await redisService.setValue('hash', accountHash, username);
  }

  // Update the player, by creating a new snapshot
  const [playerDetails, isNew] = await playerServices.updatePlayer({
    username: getString(username)
  });

  return { statusCode: isNew ? 201 : 200, response: playerDetails };
}

// POST /players/:username/assert-type
async function assertType(req: Request): Promise<ControllerResponse> {
  // Find the player using the username param
  const player = await playerUtils.resolvePlayer({
    username: getString(req.params.username)
  });

  // (Forcefully) Assert the player's account type
  const [, updatedPlayer, changed] = await playerServices.assertPlayerType(player, true);

  return {
    statusCode: 200,
    response: { player: updatedPlayer, changed }
  };
}

// POST /players/:username/import-history
async function importPlayer(req: Request): Promise<ControllerResponse> {
  // Find the player using the username param
  const player = await playerUtils.resolvePlayer({
    username: getString(req.params.username)
  });

  const { count } = await playerServices.importPlayerHistory(player);

  return {
    statusCode: 200,
    response: { count, message: `Sucessfully imported ${count} snapshots from CML.` }
  };
}

// GET /players/:username
// GET /players/id/:id
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

// GET /players/:username/achievements
// GET /players/id/:id/achievements
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

// GET /players/:username/achievements/progress
// GET /players/id/:id/achievements/progress
async function achievementsProgress(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  // Get all player achievements (by player id)
  const result = await achievementServices.findPlayerAchievementProgress({ id: playerId });

  if (playerId && result.filter(a => a.absoluteProgress > 0).length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: result };
}

// GET /players/:username/competitions
// GET /players/id/:id/competitions
async function competitions(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const results = await competitionServices.findPlayerParticipations({
    playerId,
    status: getEnum(req.query.status),
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  if (playerId && results.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: results };
}

// GET /players/:username/competitions/standings
// GET /players/id/:id/competitions/standings
async function competitionStandings(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const results = await competitionServices.findPlayerParticipationsStandings({
    playerId,
    status: getEnum(req.query.status)
  });

  if (playerId && results.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: results };
}

// GET /players/:username/groups
// GET /players/id/:id/groups
async function groups(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const results = await groupServices.findPlayerMemberships({
    playerId,
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  if (playerId && results.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: results };
}

// GET /players/:username/gained
// GET /players/id/:id/gained
async function gained(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const results = await deltaServices.findPlayerDeltas({
    id: playerId,
    period: getEnum(req.query.period),
    minDate: getDate(req.query.startDate),
    maxDate: getDate(req.query.endDate),
    formatting: getEnum(req.query.formatting)
  });

  return { statusCode: 200, response: results };
}

// GET /players/:username/records
// GET /players/id/:id/records
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

// GET /players/:username/snapshots
// GET /players/id/:id/snapshots
async function snapshots(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId({
    id: getNumber(req.params.id),
    username: getString(req.params.username)
  });

  const results = await snapshotServices.findPlayerSnapshots({
    id: playerId,
    period: getEnum(req.query.period),
    minDate: getDate(req.query.startDate),
    maxDate: getDate(req.query.endDate),
    offset: getNumber(req.query.offset),
    limit: req.query.limit ? Math.min(50, getNumber(req.query.limit)) : 20
  });

  const formattedSnapshots = results.map(s => snapshotUtils.format(s));

  if (playerId && formattedSnapshots.length === 0) {
    // Ensure this player ID exists (if not, it'll throw a 404 error)
    await playerUtils.resolvePlayer({ id: playerId });
  }

  return { statusCode: 200, response: formattedSnapshots };
}

// GET /players/:username/names
// GET /players/id/:id/names
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

// PUT /players/:username/country
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

// DELETE /players/:username
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
  competitionStandings,
  groups,
  gained,
  records,
  snapshots,
  names,
  changeCountry,
  deletePlayer
};
