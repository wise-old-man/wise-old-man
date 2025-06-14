import { JobType, jobManager } from '../../../../jobs';
import prisma, { Player, PrismaTypes, Snapshot, PlayerAnnotation } from '../../../../prisma';
import { PlayerBuild, PlayerStatus, PlayerType, PlayerAnnotationType } from '../../../../utils';
import { BadRequestError, ForbiddenError, RateLimitError, ServerError } from '../../../errors';
import { computePlayerMetrics } from '../../efficiency/services/ComputePlayerMetricsService';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import { getBuild, sanitize, standardize, validateUsername } from '../player.utils';
import { archivePlayer } from './ArchivePlayerService';
import { assertPlayerType } from './AssertPlayerTypeService';
import { reviewFlaggedPlayer } from './ReviewFlaggedPlayerService';
import { buildCompoundRedisKey, redisClient } from '../../../../services/redis.service';
import { eventEmitter, EventType } from '../../../events';
import { adaptFetchableToThrowable, fetchHiscoresData } from '../../../../services/jagex.service';

type UpdatablePlayerFields = PrismaTypes.XOR<
  PrismaTypes.PlayerUpdateInput,
  PrismaTypes.PlayerUncheckedUpdateInput
> & { type?: PlayerType };

let UPDATE_COOLDOWN = process.env.NODE_ENV === 'test' ? 0 : 60;

async function updatePlayer(username: string, skipFlagChecks = false) {
  // Find a player with the given username or create a new one if needed
  const [player, isNew] = await findOrCreate(username);

  if (player.annotations?.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    throw new ForbiddenError(
      'Failed to update: Player has opted out of tracking. If this is your account and you want to opt back in, contact us on Discord.'
    );
  }

  if (player.annotations?.some(a => a.type === PlayerAnnotationType.BLOCKED)) {
    throw new ForbiddenError(
      'Failed to update: This player has been blocked, please contact us on Discord for more information.'
    );
  }

  if (player.status === PlayerStatus.ARCHIVED) {
    throw new BadRequestError('Failed to update: Player is archived.');
  }

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
  const previousSnapshot = player.latestSnapshot;

  let currentStats: Snapshot | undefined;

  // Fetch the new player stats from the hiscores API
  try {
    currentStats = await fetchStats(player, updatedPlayerFields.type, previousSnapshot);
  } catch (error) {
    if (error.statusCode === 400) {
      // If failed to load this player's stats from the hiscores, and they're not "regular" or "unknown"
      // we should at least check if their type has changed (e.g. the name was transfered to a regular acc)
      if (await shouldReviewType(player)) {
        const hasTypeChanged = await reviewType(player).catch(() => false);
        // If they did in fact change type, call this function recursively,
        // so that it fetches their stats from the correct hiscores.
        if (hasTypeChanged) return updatePlayer(player.username);
      }

      // If it failed to load their stats, and the player isn't unranked,
      // we should start a background job to check (a few times) if they're really unranked
      if (!isNew && player.status !== PlayerStatus.UNRANKED && player.status !== PlayerStatus.BANNED) {
        jobManager.add(JobType.CHECK_PLAYER_RANKED, { username: player.username });
      }
    }

    throw error;
  }

  // There has been a significant change in this player's stats, mark it as flagged
  if (!skipFlagChecks && previousSnapshot && !snapshotUtils.withinRange(previousSnapshot, currentStats)) {
    if (player.status !== PlayerStatus.FLAGGED) {
      const handled = await handlePlayerFlagged(player, previousSnapshot, currentStats);
      // If the flag was properly handled (via a player archive),
      // call this function recursively, so that the new player can be tracked
      if (handled) return updatePlayer(player.username);
    }

    throw new ServerError('Failed to update: Player is flagged.');
  }

  // The player has gained exp/kc/scores since the last update
  const hasChanged = !previousSnapshot || snapshotUtils.hasChanged(previousSnapshot, currentStats);

  // If this player (IM/HCIM/UIM/FSW) hasn't gained exp in a while, we should review their type.
  // This is because when players de-iron, their ironman stats stay frozen, so they don't gain exp.
  // To fix, we can check the "regular" hiscores to see if they've de-ironed, and update their type accordingly.
  if (!hasChanged && (await shouldReviewType(player))) {
    const hasTypeChanged = await reviewType(player);

    // If they did in fact de-iron, call this function recursively,
    // so that it fetches their stats from the correct hiscores.
    if (hasTypeChanged) return updatePlayer(player.username);
  }

  // Refresh the player's build
  updatedPlayerFields.build = getBuild(
    currentStats,
    player.annotations?.some(a => a.type === PlayerAnnotationType.FAKE_F2P) ?? false
  );
  updatedPlayerFields.status = PlayerStatus.ACTIVE;

  const computedMetrics = await computePlayerMetrics(
    {
      id: player.id,
      type: (updatedPlayerFields.type as PlayerType) || player.type,
      build: (updatedPlayerFields.build as PlayerBuild) || player.build
    },
    currentStats
  );

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

  eventEmitter.emit(EventType.PLAYER_UPDATED, {
    username: updatedPlayer.username,
    hasChanged,
    previousUpdatedAt: previousSnapshot?.createdAt ?? null
  });

  return { updatedPlayer, isNew };
}

async function shouldReviewType(player: Player) {
  if (player.type === PlayerType.UNKNOWN || player.type === PlayerType.REGULAR) {
    return false;
  }

  // Check if this player has been reviewed recently (past 7 days)
  return !(await redisClient.get(buildCompoundRedisKey('cd', 'PlayerTypeReview', player.username)));
}

async function handlePlayerFlagged(player: Player, previousStats: Snapshot, rejectedStats: Snapshot) {
  await prisma.player.update({
    data: { status: PlayerStatus.FLAGGED },
    where: { id: player.id }
  });

  const flaggedContext = reviewFlaggedPlayer(player, previousStats, rejectedStats);

  if (flaggedContext) {
    eventEmitter.emit(EventType.PLAYER_FLAGGED, {
      username: player.username,
      context: flaggedContext
    });

    return false;
  }

  // no context, we know this is a name transfer and can be auto-archived
  await archivePlayer(player);

  return true;
}

async function reviewType(player: Player) {
  const [, , changed] = await assertPlayerType(player, true);

  // Store the current timestamp in Redis, so that we don't review this player again for 7 days
  await redisClient.set(
    buildCompoundRedisKey('cd', 'PlayerTypeReview', player.username),
    Date.now(),
    'PX',
    604_800_000
  );

  // Also write to this key, so that we can slowly migrate to a new naming convention
  // In the future, we can remove the version above, and move all reads to this new version
  await redisClient.set(
    buildCompoundRedisKey('cooldown', 'player_type_review', player.username),
    Date.now(),
    'PX',
    604_800_000
  );

  return changed;
}

async function fetchStats(player: Player, type?: PlayerType, previousStats?: Snapshot): Promise<Snapshot> {
  // Load data from OSRS hiscores
  const hiscoresCSV = adaptFetchableToThrowable(
    await fetchHiscoresData(player.username, type || player.type)
  );

  // Convert the csv data to a Snapshot instance
  const newSnapshot = await snapshotUtils.parseHiscoresSnapshot(player.id, hiscoresCSV, previousStats);

  return newSnapshot;
}

async function findOrCreate(
  username: string
): Promise<[Player & { latestSnapshot?: Snapshot } & { annotations?: PlayerAnnotation[] }, boolean]> {
  const player = await prisma.player.findFirst({
    where: {
      username: standardize(username)
    },
    include: {
      latestSnapshot: true,
      annotations: true
    }
  });

  if (player) {
    // If this player's "latestSnapshotId" isn't populated, fetch the latest snapshot from the DB
    if (!player.latestSnapshot) {
      const latestSnapshot = await prisma.snapshot.findFirst({
        where: { playerId: player.id },
        orderBy: { createdAt: 'desc' }
      });

      if (latestSnapshot) {
        player.latestSnapshot = latestSnapshot;
      }
    }

    return [
      {
        ...player,
        latestSnapshot: player.latestSnapshot ?? undefined,
        annotations: player.annotations ?? []
      },
      false
    ];
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
