import { AsyncResult, complete, errored, isErrored } from '@attio/fetchable';
import { jobManager, JobType } from '../../../../jobs';
import prisma, { PrismaTypes } from '../../../../prisma';
import { fetchHiscoresJSON, HiscoresError } from '../../../../services/jagex.service';
import { buildCompoundRedisKey, redisClient } from '../../../../services/redis.service';
import {
  Player,
  PlayerAnnotation,
  PlayerAnnotationType,
  PlayerBuild,
  PlayerStatus,
  PlayerType,
  Snapshot
} from '../../../../types';
import { eventEmitter, EventType } from '../../../events';
import { computePlayerMetrics } from '../../efficiency/services/ComputePlayerMetricsService';
import { buildHiscoresSnapshot } from '../../snapshots/services/BuildHiscoresSnapshot';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import {
  getBuild,
  PlayerUsernameValidationError,
  sanitize,
  standardize,
  validateUsername
} from '../player.utils';
import { archivePlayer } from './ArchivePlayerService';
import { assertPlayerType } from './AssertPlayerTypeService';
import { reviewFlaggedPlayer } from './ReviewFlaggedPlayerService';

type UpdatablePlayerFields = PrismaTypes.XOR<
  PrismaTypes.PlayerUpdateInput,
  PrismaTypes.PlayerUncheckedUpdateInput
> & { type?: PlayerType };

let UPDATE_COOLDOWN = process.env.NODE_ENV === 'test' ? 0 : 60;

async function acquireLock(
  username: string
): AsyncResult<() => Promise<number>, { code: 'LOCK_ALREADY_EXISTS' }> {
  const lockRedisKey = buildCompoundRedisKey('player-update-lock', standardize(username));

  const hasLock = await redisClient.get(lockRedisKey);

  if (hasLock) {
    return errored({ code: 'LOCK_ALREADY_EXISTS' });
  }

  await redisClient.set(lockRedisKey, 'true', 'PX', 60_000);

  return complete(() => {
    return redisClient.del(lockRedisKey);
  });
}

async function updatePlayer(
  username: string,
  skipFlagChecks = false
): AsyncResult<
  { player: Player; isNew: boolean },
  | HiscoresError
  | { code: 'PLAYER_OPTED_OUT' }
  | { code: 'PLAYER_IS_FLAGGED' }
  | { code: 'PLAYER_IS_BLOCKED' }
  | { code: 'PLAYER_IS_ARCHIVED' }
  | { code: 'PLAYER_IS_RATE_LIMITED' }
  | { code: 'USERNAME_VALIDATION_ERROR'; subError: PlayerUsernameValidationError }
> {
  const lockResult = await acquireLock(username);

  if (isErrored(lockResult)) {
    return errored({ code: 'PLAYER_IS_RATE_LIMITED' });
  }

  const releaseLock = lockResult.value;

  // Find a player with the given username or create a new one if needed
  const findPlayerResult = await findOrCreate(username);

  if (isErrored(findPlayerResult)) {
    await releaseLock();

    return findPlayerResult;
  }

  const { player, isNew } = findPlayerResult.value;

  if (player.annotations?.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    await releaseLock();

    return errored({ code: 'PLAYER_OPTED_OUT' });
  }

  if (player.annotations?.some(a => a.type === PlayerAnnotationType.BLOCKED)) {
    await releaseLock();

    return errored({ code: 'PLAYER_IS_BLOCKED' });
  }

  if (player.status === PlayerStatus.ARCHIVED) {
    await releaseLock();

    return errored({ code: 'PLAYER_IS_ARCHIVED' });
  }

  // If the player was updated recently, don't update it
  if (!shouldUpdate(player) && !isNew) {
    await releaseLock();

    return errored({ code: 'PLAYER_IS_RATE_LIMITED' });
  }

  const updatedPlayerFields: UpdatablePlayerFields = {};

  // Always determine the rank before tracking (to fetch correct ranks)
  if (player.type === PlayerType.UNKNOWN) {
    const typeAssertionResult = await assertPlayerType(player);

    if (isErrored(typeAssertionResult)) {
      await releaseLock();

      return typeAssertionResult;
    }

    updatedPlayerFields.type = typeAssertionResult.value.type;
  }

  // Fetch the previous player stats from the database
  const previousSnapshot = player.latestSnapshot;

  // Fetch the new player stats from the hiscores API
  const currentStatsResult = await fetchStats(player, updatedPlayerFields.type, previousSnapshot);

  if (isErrored(currentStatsResult)) {
    // If failed to load this player's stats from the hiscores, and they're not "regular" or "unknown"
    // we should at least check if their type has changed (e.g. the name was transfered to a regular acc)
    if (currentStatsResult.error.code === 'HISCORES_USERNAME_NOT_FOUND') {
      if (await shouldReviewType(player)) {
        const typeReviewResult = await reviewType(player);

        if (isErrored(typeReviewResult)) {
          await releaseLock();

          return typeReviewResult;
        }

        // If they did in fact change type, call this function recursively,
        // so that it fetches their stats from the correct hiscores.
        if (typeReviewResult.value.changed) {
          await releaseLock();

          return updatePlayer(player.username);
        }
      }

      // If it failed to load their stats, and the player isn't unranked,
      // we should start a background job to check (a few times) if they're really unranked
      if (!isNew && player.status !== PlayerStatus.UNRANKED && player.status !== PlayerStatus.BANNED) {
        jobManager.add(JobType.CHECK_PLAYER_RANKED, { username: player.username });
      }
    }

    await releaseLock();

    return currentStatsResult;
  }

  const currentStats = currentStatsResult.value;

  // There has been a significant change in this player's stats, mark it as flagged
  if (!skipFlagChecks && previousSnapshot && !snapshotUtils.withinRange(previousSnapshot, currentStats)) {
    if (player.status !== PlayerStatus.FLAGGED) {
      const handled = await handlePlayerFlagged(player, previousSnapshot, currentStats);
      // If the flag was properly handled (via a player archive),
      // call this function recursively, so that the new player can be tracked
      if (handled) {
        await releaseLock();

        return updatePlayer(player.username);
      }
    }

    await releaseLock();

    return errored({ code: 'PLAYER_IS_FLAGGED' });
  }

  // The player has gained exp/kc/scores since the last update
  const hasChanged = !previousSnapshot || snapshotUtils.hasChanged(previousSnapshot, currentStats);

  // If this player (IM/HCIM/UIM) hasn't gained exp in a while, we should review their type.
  // This is because when players de-iron, their ironman stats stay frozen, so they don't gain exp.
  // To fix, we can check the "regular" hiscores to see if they've de-ironed, and update their type accordingly.
  if (!hasChanged && (await shouldReviewType(player))) {
    const hasTypeChanged = await reviewType(player);

    // If they did in fact de-iron, call this function recursively,
    // so that it fetches their stats from the correct hiscores.
    if (hasTypeChanged) {
      await releaseLock();

      return updatePlayer(player.username);
    }
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
      type: updatedPlayerFields.type ?? player.type,
      build: (updatedPlayerFields.build as PlayerBuild) ?? player.build
    },
    currentStats
  );

  // Set the player's global computed data
  updatedPlayerFields.exp = Math.max(0, currentStats.overallExperience);
  updatedPlayerFields.ehp = computedMetrics.ehpValue;
  updatedPlayerFields.ehb = computedMetrics.ehbValue;
  updatedPlayerFields.ttm = computedMetrics.ttm;
  updatedPlayerFields.tt200m = computedMetrics.tt200m;

  updatedPlayerFields.sailing = currentStats.sailingExperience;
  updatedPlayerFields.sailingRank = currentStats.sailingRank;

  // Add the computed metrics to the snapshot
  currentStats.ehpValue = computedMetrics.ehpValue;
  currentStats.ehpRank = computedMetrics.ehpRank;
  currentStats.ehbValue = computedMetrics.ehbValue;
  currentStats.ehbRank = computedMetrics.ehbRank;

  // Create (and save) a new snapshot
  const newSnapshot = await prisma.snapshot.create({
    data: currentStats
  });

  updatedPlayerFields.updatedAt = newSnapshot.createdAt;
  updatedPlayerFields.latestSnapshotId = newSnapshot.id;
  updatedPlayerFields.latestSnapshotDate = newSnapshot.createdAt;

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

  await releaseLock();

  return complete({
    player: updatedPlayer,
    isNew
  });
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

async function reviewType(player: Player): AsyncResult<{ changed: boolean }, HiscoresError> {
  const typeAssertionResult = await assertPlayerType(player);

  if (isErrored(typeAssertionResult)) {
    return typeAssertionResult;
  }

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

  return complete({
    changed: typeAssertionResult.value.changed
  });
}

async function fetchStats(
  player: Player,
  type?: PlayerType,
  previousStats?: Snapshot
): AsyncResult<Snapshot, HiscoresError> {
  const hiscoresResult = await fetchHiscoresJSON(player.username, type || player.type);

  if (isErrored(hiscoresResult)) {
    return hiscoresResult;
  }

  const newSnapshot = buildHiscoresSnapshot(player.id, hiscoresResult.value, previousStats);

  return complete(newSnapshot);
}

async function findOrCreate(username: string): AsyncResult<
  {
    player: Player & { latestSnapshot?: Snapshot } & { annotations?: PlayerAnnotation[] };
    isNew: boolean;
  },
  {
    code: 'USERNAME_VALIDATION_ERROR';
    subError: PlayerUsernameValidationError;
  }
> {
  const player = await prisma.player.findFirst({
    where: {
      username: standardize(username)
    },
    include: {
      annotations: true,
      latestSnapshot: true
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

    return complete({
      player: {
        ...player,
        latestSnapshot: player.latestSnapshot ?? undefined,
        annotations: player.annotations ?? []
      },
      isNew: false
    });
  }

  const cleanUsername = standardize(username);
  const validationResult = validateUsername(cleanUsername);

  if (isErrored(validationResult)) {
    return errored({
      code: 'USERNAME_VALIDATION_ERROR',
      subError: validationResult.error
    });
  }

  const newPlayer = await prisma.player.create({
    data: {
      username: cleanUsername,
      displayName: sanitize(username)
    }
  });

  return complete({
    player: newPlayer,
    isNew: true
  });
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
