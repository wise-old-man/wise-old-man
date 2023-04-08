import { z } from 'zod';
import prisma, { modifyPlayer, modifySnapshot, Player, PrismaTypes, Snapshot } from '../../../../prisma';
import { PlayerType, PlayerBuild, PlayerStatus } from '../../../../utils';
import { RateLimitError, ServerError } from '../../../errors';
import logger from '../../../util/logging';
import { getBuild, shouldUpdate } from '../player.utils';
import redisService from '../../../services/external/redis.service';
import * as jagexService from '../../../services/external/jagex.service';
import * as efficiencyServices from '../../efficiency/efficiency.services';
import * as snapshotServices from '../../snapshots/snapshot.services';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import * as playerEvents from '../player.events';
import { PlayerDetails } from '../player.types';
import { findPlayer } from './FindPlayerService';
import { assertPlayerType } from './AssertPlayerTypeService';
import { fetchPlayerDetails } from './FetchPlayerDetailsService';
import { reviewFlaggedPlayer } from './ReviewFlaggedPlayerService';
import { archivePlayer } from './ArchivePlayerService';

type UpdatablePlayerFields = PrismaTypes.XOR<
  PrismaTypes.PlayerUpdateInput,
  PrismaTypes.PlayerUncheckedUpdateInput
>;

const inputSchema = z.object({
  username: z.string(),
  skipFlagChecks: z.boolean().optional().default(false)
});

type UpdatePlayerParams = z.infer<typeof inputSchema>;
type UpdatePlayerResult = [playerDetails: PlayerDetails, isNew: boolean];

async function updatePlayer(payload: UpdatePlayerParams): Promise<UpdatePlayerResult> {
  const { username, skipFlagChecks } = inputSchema.parse(payload);

  // Find a player with the given username or create a new one if needed
  const [player, isNew] = await findPlayer({ username, createIfNotFound: true });

  // If the player was updated recently, don't update it
  if (!shouldUpdate(player) && !isNew) {
    throw new RateLimitError(`Error: ${username} has been updated recently.`);
  }

  const updatedPlayerFields: UpdatablePlayerFields = {};

  // Always determine the rank before tracking (to fetch correct ranks)
  if (player.type === PlayerType.UNKNOWN) {
    const [type] = await assertPlayerType(player);
    updatedPlayerFields.type = type;
  }

  // Fetch the previous player stats from the database
  const previousStats = await snapshotServices.findPlayerSnapshot({ id: player.id });

  let currentStats: Snapshot | undefined;

  // Fetch the new player stats from the hiscores API
  try {
    currentStats = await fetchStats(player, updatedPlayerFields.type as PlayerType);
  } catch (error) {
    // if failed to load this player's stats from the hiscores, and they're not "regular" or "unknown"
    // we should at least check if their type has changed (e.g. the name was transfered to a regular acc)
    if (error.statusCode === 400 && (await shouldReviewType(player))) {
      const hasTypeChanged = await reviewType(player);
      // If they did in fact change type, call this function recursively,
      // so that it fetches their stats from the correct hiscores.
      if (hasTypeChanged) return updatePlayer(player);
    }

    throw error;
  }

  // There has been a significant change in this player's stats, mark it as flagged
  if (!skipFlagChecks && !snapshotUtils.withinRange(previousStats, currentStats)) {
    logger.moderation(`[Player:${username}] Flagged`);

    if (player.status !== PlayerStatus.FLAGGED) {
      const handled = await handlePlayerFlagged(player, previousStats, currentStats);
      // If the flag was properly handled (via a player archive),
      // call this function recursively, so that the new player can be tracked
      if (handled) return updatePlayer({ username: player.username });
    }

    throw new ServerError('Failed to update: Player is flagged.');
  }

  // The player has gained exp/kc/scores since the last update
  const hasChanged = snapshotUtils.hasChanged(previousStats, currentStats);

  // If this player (IM/HCIM/UIM/FSW) hasn't gained exp in a while, we should review their type.
  // This is because when players de-iron, their ironman stats stay frozen, so they don't gain exp.
  // To fix, we can check the "regular" hiscores to see if they've de-ironed, and update their type accordingly.
  if (!hasChanged && (await shouldReviewType(player))) {
    const hasTypeChanged = await reviewType(player);

    // If they did in fact de-iron, call this function recursively,
    // so that it fetches their stats from the correct hiscores.
    if (hasTypeChanged) return updatePlayer(player);
  }

  // Refresh the player's build
  updatedPlayerFields.build = getBuild(currentStats);
  updatedPlayerFields.flagged = false;
  updatedPlayerFields.status = PlayerStatus.ACTIVE;

  const computedMetrics = await efficiencyServices.computePlayerMetrics({
    player: {
      id: player.id,
      type: (updatedPlayerFields.type as PlayerType) || player.type,
      build: (updatedPlayerFields.build as PlayerBuild) || player.build
    },
    snapshot: currentStats
  });

  // Set the player's global computed data
  updatedPlayerFields.exp = Math.max(0, currentStats.overallExperience);
  updatedPlayerFields.ehp = computedMetrics.ehpValue;
  updatedPlayerFields.ehb = computedMetrics.ehbValue;
  updatedPlayerFields.ttm = computedMetrics.ttm;
  updatedPlayerFields.tt200m = computedMetrics.tt200m;

  // Add the computed metrics to the snapshot
  currentStats.ehpValue = computedMetrics.ehpValue;
  currentStats.ehpRank = computedMetrics.ehpRank;
  currentStats.ehbValue = computedMetrics.ehbValue;
  currentStats.ehbRank = computedMetrics.ehbRank;

  // Create (and save) a new snapshot
  const newSnapshot = await prisma.snapshot.create({ data: currentStats }).then(modifySnapshot);

  updatedPlayerFields.latestSnapshotId = newSnapshot.id;
  updatedPlayerFields.updatedAt = newSnapshot.createdAt;

  if (hasChanged) updatedPlayerFields.lastChangedAt = newSnapshot.createdAt;

  // update player with all this new data
  const updatedPlayer = await prisma.player
    .update({
      data: updatedPlayerFields,
      where: { id: player.id }
    })
    .then(modifyPlayer);

  playerEvents.onPlayerUpdated(updatedPlayer, newSnapshot, hasChanged);

  const playerDetails = await fetchPlayerDetails(updatedPlayer, newSnapshot);

  return [playerDetails, isNew];
}

async function shouldReviewType(player: Player) {
  if (
    player.status === PlayerStatus.FLAGGED ||
    player.type === PlayerType.UNKNOWN ||
    player.type === PlayerType.REGULAR
  ) {
    return false;
  }

  // Check if this player has been reviewed recently (past 7 days)
  return !(await redisService.getValue('cd:PlayerTypeReview', player.username));
}

async function handlePlayerFlagged(player: Player, previousStats: Snapshot, rejectedStats: Snapshot) {
  await prisma.player.update({
    data: { flagged: true, status: PlayerStatus.FLAGGED },
    where: { id: player.id }
  });

  const flaggedContext = reviewFlaggedPlayer(player, previousStats, rejectedStats);

  if (flaggedContext) {
    playerEvents.onPlayerFlagged(player, flaggedContext);
    return false;
  }

  // no context, we know this is a name transfer and can be auto-archived
  const { archivedPlayer } = await archivePlayer(player);

  playerEvents.onPlayerArchived(archivedPlayer, player.displayName);

  return true;
}

async function reviewType(player: Player) {
  logger.moderation(`[Player:${player.username}] Reviewing type`);

  const [, , changed] = await assertPlayerType(player, true);

  // Store the current timestamp in Redis, so that we don't review this player again for 7 days
  await redisService.setValue('cd:PlayerTypeReview', player.username, Date.now(), 604_800_000);

  return changed;
}

async function fetchStats(player: Player, type?: PlayerType): Promise<Snapshot> {
  // Load data from OSRS hiscores
  const hiscoresCSV = await jagexService.getHiscoresData(player.username, type || player.type);

  // Convert the csv data to a Snapshot instance
  const newSnapshot = await snapshotServices.buildSnapshot({ playerId: player.id, rawCSV: hiscoresCSV });

  return newSnapshot;
}

export { updatePlayer };
