import { Request } from 'express';
import { ForbiddenError, ServerError } from '../../errors';
import * as adminGuard from '../../guards/admin.guard';
import * as groupServices from '../groups/group.services';
import * as competitionServices from '../competitions/competition.services';
import * as playerServices from './player.services';
import * as snapshotUtils from '../snapshots/snapshot.utils';
import { getPlayerEfficiencyMap } from '../efficiency/efficiency.utils';
import * as playerUtils from './player.utils';
import { getDate, getEnum, getNumber, getString } from '../../util/validation';
import { ControllerResponse } from '../../util/routing';
import { findPlayerDeltas } from '../deltas/services/FindPlayerDeltasService';
import { findPlayerNameChanges } from '../name-changes/services/FindPlayerNameChangesService';
import { findPlayerRecords } from '../records/services/FindPlayerRecordsService';
import { findPlayerSnapshotTimeline } from '../snapshots/services/FindPlayerSnapshotTimelineService';
import { findPlayerSnapshots } from '../snapshots/services/FindPlayerSnapshotsService';
import { rollbackSnapshots } from '../snapshots/services/RollbackSnapshotsService';
import { findPlayerAchievements } from '../achievements/services/FindPlayerAchievementsService';
import { findPlayerAchievementProgress } from '../achievements/services/FindPlayerAchievementProgressService';

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
async function track(req: Request): Promise<ControllerResponse> {
  const { force } = req.body;
  const { username } = req.params;

  // Force updates are moderator-only
  if (force && !adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  // Update the player, and create a new snapshot
  const [playerDetails, isNew] = await playerServices.updatePlayer({
    username: getString(username),
    skipFlagChecks: Boolean(force)
  });

  return { statusCode: isNew ? 201 : 200, response: playerDetails };
}

// POST /players/:username/assert-type
async function assertType(req: Request): Promise<ControllerResponse> {
  // Find the player using the username param
  const player = await playerUtils.resolvePlayer(getString(req.params.username));

  // (Forcefully) Assert the player's account type
  const [, updatedPlayer, changed] = await playerServices.assertPlayerType(player, true);

  return {
    statusCode: 200,
    response: { player: updatedPlayer, changed }
  };
}

// POST /players/:username/import-history
async function importPlayer(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  // Find the player using the username param
  const player = await playerUtils.resolvePlayer(getString(req.params.username));

  const { count } = await playerServices.importPlayerHistory(player);

  return {
    statusCode: 200,
    response: { count, message: `Successfully imported ${count} snapshots from CML.` }
  };
}

// GET /players/:username
async function details(req: Request): Promise<ControllerResponse> {
  // Fetch the player's details
  const playerDetails = await playerServices.fetchPlayerDetails({
    username: getString(req.params.username)
  });

  return { statusCode: 200, response: playerDetails };
}

// GET /players/id/:id
async function detailsById(req: Request): Promise<ControllerResponse> {
  // Fetch the player's details
  const playerDetails = await playerServices.fetchPlayerDetails({
    id: getNumber(req.params.id)
  });

  return { statusCode: 200, response: playerDetails };
}

// GET /players/:username/achievements
async function achievements(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));

  // Get all player achievements (by player id)
  const achievements = await findPlayerAchievements({ id: playerId });

  return { statusCode: 200, response: achievements };
}

// GET /players/:username/achievements/progress
async function achievementsProgress(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));

  // Get all player achievements (by player id)
  const result = await findPlayerAchievementProgress({ id: playerId });

  return { statusCode: 200, response: result };
}

// GET /players/:username/competitions
async function competitions(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));

  const results = await competitionServices.findPlayerParticipations({
    playerId,
    status: getEnum(req.query.status)
  });

  return { statusCode: 200, response: results };
}

// GET /players/:username/competitions/standings
async function competitionStandings(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));

  const results = await competitionServices.findPlayerParticipationsStandings({
    playerId,
    status: getEnum(req.query.status)
  });

  return { statusCode: 200, response: results };
}

// GET /players/:username/groups
async function groups(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));

  const results = await groupServices.findPlayerMemberships({
    playerId,
    limit: getNumber(req.query.limit),
    offset: getNumber(req.query.offset)
  });

  return { statusCode: 200, response: results };
}

// GET /players/:username/gained
async function gained(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));

  const results = await findPlayerDeltas({
    id: playerId,
    period: getEnum(req.query.period),
    minDate: getDate(req.query.startDate),
    maxDate: getDate(req.query.endDate),
    formatting: getEnum(req.query.formatting)
  });

  return { statusCode: 200, response: results };
}

// GET /players/:username/records
async function records(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));

  // Fetch all player records for the given period and metric
  const results = await findPlayerRecords({
    id: playerId,
    period: getEnum(req.query.period),
    metric: getEnum(req.query.metric)
  });

  return { statusCode: 200, response: results };
}

// GET /players/:username/snapshots
async function snapshots(req: Request): Promise<ControllerResponse> {
  const player = await playerUtils.resolvePlayer(getString(req.params.username));

  let limit = req.query.limit ? getNumber(req.query.limit) : undefined;
  if (limit && limit > 50) limit = 50;

  const results = await findPlayerSnapshots({
    id: player.id,
    period: getEnum(req.query.period),
    minDate: getDate(req.query.startDate),
    maxDate: getDate(req.query.endDate),
    limit,
    offset: getNumber(req.query.offset)
  });

  const formattedSnapshots = results.map(s => snapshotUtils.format(s, getPlayerEfficiencyMap(s, player)));

  return {
    statusCode: 200,
    response: formattedSnapshots
  };
}

// GET /players/:username/snapshots/timeline
async function timeline(req: Request): Promise<ControllerResponse> {
  const player = await playerUtils.resolvePlayer(getString(req.params.username));

  const results = await findPlayerSnapshotTimeline({
    id: player.id,
    metric: getEnum(req.query.metric),
    period: getEnum(req.query.period),
    minDate: getDate(req.query.startDate),
    maxDate: getDate(req.query.endDate)
  });

  return {
    statusCode: 200,
    response: results
  };
}

// GET /players/:username/names
async function names(req: Request): Promise<ControllerResponse> {
  const playerId = await playerUtils.resolvePlayerId(getString(req.params.username));
  const result = await findPlayerNameChanges({ playerId });

  return { statusCode: 200, response: result };
}

// GET /players/:username/archives
async function archives(req: Request): Promise<ControllerResponse> {
  const result = await playerServices.findPlayerArchives({
    username: getString(req.params.username)
  });

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

// POST /players/:username/rollback
// REQUIRES ADMIN PASSWORD
async function rollback(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const username = getString(req.params.username);
  const player = await playerUtils.resolvePlayer(username);

  await rollbackSnapshots({
    playerId: player.id,
    deleteAllSince: req.body.untilLastChange && player.lastChangedAt ? player.lastChangedAt : undefined
  });

  const [playerDetails] = await playerServices.updatePlayer({ username });

  return {
    statusCode: 200,
    response: { message: `Successfully rolled back player: ${playerDetails.displayName}` }
  };
}

// POST /players/:username/archive
// REQUIRES ADMIN PASSWORD
async function archive(req: Request): Promise<ControllerResponse> {
  if (!adminGuard.checkAdminPermissions(req)) {
    throw new ForbiddenError('Incorrect admin password.');
  }

  const username = getString(req.params.username);
  const player = await playerUtils.resolvePlayer(username);

  const { archivedPlayer } = await playerServices.archivePlayer(player);

  try {
    await playerServices.updatePlayer({ username });
  } catch (e) {
    throw new ServerError('Failed to update new player post-archive.');
  }

  return {
    statusCode: 200,
    response: archivedPlayer
  };
}

export {
  search,
  track,
  rollback,
  archive,
  assertType,
  importPlayer,
  details,
  detailsById,
  achievements,
  achievementsProgress,
  competitions,
  competitionStandings,
  groups,
  gained,
  records,
  timeline,
  snapshots,
  names,
  archives,
  changeCountry,
  deletePlayer
};
