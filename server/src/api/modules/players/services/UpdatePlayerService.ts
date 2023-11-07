import { z } from 'zod';
import { isTesting } from '../../../../env';
import prisma, { Player, PrismaTypes, Snapshot } from '../../../../prisma';
import { PlayerBuild, PlayerStatus, PlayerType } from '../../../../utils';
import { BadRequestError, RateLimitError, ServerError } from '../../../errors';
import { JobType, jobManager } from '../../../jobs';
import * as jagexService from '../../../services/external/jagex.service';
import logger from '../../../util/logging';
import * as efficiencyServices from '../../efficiency/efficiency.services';
import * as snapshotServices from '../../snapshots/snapshot.services';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import * as playerEvents from '../player.events';
import { PlayerDetails } from '../player.types';
import { formatPlayerDetails, getBuild, sanitize, standardize, validateUsername } from '../player.utils';

type UpdatablePlayerFields = PrismaTypes.XOR<
  PrismaTypes.PlayerUpdateInput,
  PrismaTypes.PlayerUncheckedUpdateInput
>;

let UPDATE_COOLDOWN = isTesting() ? 0 : 60;

const inputSchema = z.object({
  username: z.string(),
  skipFlagChecks: z.boolean().optional().default(false)
});

type UpdatePlayerParams = z.infer<typeof inputSchema>;
type UpdatePlayerResult = [playerDetails: PlayerDetails, isNew: boolean];

async function updatePlayer(payload: UpdatePlayerParams): Promise<UpdatePlayerResult> {
  const { username, skipFlagChecks } = inputSchema.parse(payload);

  // Find a player with the given username or create a new one if needed
  const [player, isNew] = await findOrCreate(username);

  if (player.status === PlayerStatus.ARCHIVED) {
    throw new BadRequestError('Failed to update: Player is archived.');
  }

  // If the player was updated recently, don't update it
  if (!shouldUpdate(player) && !isNew) {
    throw new RateLimitError(`Error: ${username} has been updated recently.`);
  }

  const updatedPlayerFields: UpdatablePlayerFields = {
    type: PlayerType.IRONMAN
  };

  // Fetch the previous player stats from the database
  const previousSnapshot = player.latestSnapshot;

  let currentStats: Snapshot | undefined;

  // Fetch the new player stats from the hiscores API
  try {
    currentStats = await fetchStats(player);
  } catch (error) {
    if (error.statusCode === 400) {
      // If it failed to load their stats, and the player isn't unranked,
      // we should start a background job to check (a few times) if they're really unranked
      if (player.status !== PlayerStatus.UNRANKED && player.status !== PlayerStatus.BANNED) {
        jobManager.add({
          type: JobType.CHECK_PLAYER_RANKED,
          payload: { username: player.username }
        });
      }
    }

    throw error;
  }

  // There has been a significant change in this player's stats, mark it as flagged
  if (!skipFlagChecks && !snapshotUtils.withinRange(previousSnapshot, currentStats)) {
    logger.moderation(`[Player:${username}] Flagged`);
    throw new ServerError('Failed to update: Player is flagged.');
  }

  // The player has gained exp/kc/scores since the last update
  const hasChanged = snapshotUtils.hasChanged(previousSnapshot, currentStats);

  // Refresh the player's build
  updatedPlayerFields.build = getBuild(currentStats);
  updatedPlayerFields.status = PlayerStatus.ACTIVE;

  const computedMetrics = await efficiencyServices.computePlayerMetrics({
    player: {
      id: player.id,
      build: (updatedPlayerFields.build as PlayerBuild) || player.build
    },
    snapshot: currentStats
  });

  // Set the player's global computed data
  updatedPlayerFields.leaguePoints = currentStats.league_pointsScore;
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
  const newSnapshot = await prisma.snapshot.create({
    data: currentStats
  });

  updatedPlayerFields.latestSnapshotId = newSnapshot.id;
  updatedPlayerFields.updatedAt = newSnapshot.createdAt;

  if (hasChanged) updatedPlayerFields.lastChangedAt = newSnapshot.createdAt;

  // update player with all this new data
  const updatedPlayer = await prisma.player.update({
    data: updatedPlayerFields,
    where: { id: player.id }
  });

  playerEvents.onPlayerUpdated(updatedPlayer, previousSnapshot, newSnapshot, hasChanged);

  const playerDetails = formatPlayerDetails(updatedPlayer, newSnapshot);

  return [playerDetails, isNew];
}

async function fetchStats(player: Player): Promise<Snapshot> {
  // Load data from OSRS hiscores
  const hiscoresCSV = await jagexService.fetchHiscoresData(player.username);

  // Convert the csv data to a Snapshot instance
  const newSnapshot = await snapshotServices.buildSnapshot({ playerId: player.id, rawCSV: hiscoresCSV });

  return newSnapshot;
}

async function findOrCreate(username: string): Promise<[Player & { latestSnapshot?: Snapshot }, boolean]> {
  const player = await prisma.player.findFirst({
    where: { username: standardize(username) },
    include: { latestSnapshot: true }
  });

  if (player) {
    // If this player's "latestSnapshotId" isn't populated, fetch the latest snapshot from the DB
    if (!player.latestSnapshot) {
      const latestSnapshot = await snapshotServices.findPlayerSnapshot({ id: player.id });
      if (latestSnapshot) player.latestSnapshot = latestSnapshot;
    }

    return [player, false];
  }

  const cleanUsername = standardize(username);
  const validationError = validateUsername(cleanUsername);

  if (validationError) {
    throw new BadRequestError(`Validation error: ${validationError.message}`);
  }

  const newPlayer = await prisma.player.create({
    data: {
      username: cleanUsername,
      displayName: sanitize(username)
    }
  });

  return [newPlayer, true];
}

// For integration testing purposes
export function setUpdateCooldown(seconds: number) {
  UPDATE_COOLDOWN = seconds;
}

/**
 * Checks if a given player has been updated in the last 60 seconds.
 */
function shouldUpdate(player: Pick<Player, 'updatedAt' | 'registeredAt' | 'lastChangedAt'>): boolean {
  if (!player.updatedAt) return true;

  const timeSinceLastUpdate = Math.floor((Date.now() - player.updatedAt.getTime()) / 1000);
  const timeSinceRegistration = Math.floor((Date.now() - player.registeredAt.getTime()) / 1000);

  return timeSinceLastUpdate >= UPDATE_COOLDOWN || (timeSinceRegistration <= 60 && !player.lastChangedAt);
}

export { updatePlayer };
