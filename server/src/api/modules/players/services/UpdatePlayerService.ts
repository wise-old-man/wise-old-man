import { AsyncResult, complete, errored, isErrored } from '@attio/fetchable';
import { jobManager, JobType } from '../../../../jobs';
import prisma, { PrismaTypes } from '../../../../prisma';
import { fetchHiscoresJSON, HiscoresError } from '../../../../services/jagex.service';
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
  sanitizeDisplayName,
  standardizeUsername,
  validateUsername
} from '../player.utils';

type UpdatablePlayerFields = PrismaTypes.XOR<
  PrismaTypes.PlayerUpdateInput,
  PrismaTypes.PlayerUncheckedUpdateInput
> & { type?: PlayerType };

let UPDATE_COOLDOWN = process.env.NODE_ENV === 'test' ? 0 : 60;

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
  | { code: 'PLAYER_IS_RATE_LIMITED'; lastUpdatedAt: Date }
  | { code: 'INVALID_USERNAME'; subError: PlayerUsernameValidationError }
> {
  // Find a player with the given username or create a new one if needed
  const findPlayerResult = await findOrCreate(username);

  if (isErrored(findPlayerResult)) {
    return findPlayerResult;
  }

  const { player, isNew } = findPlayerResult.value;

  if (player.annotations?.some(a => a.type === PlayerAnnotationType.OPT_OUT)) {
    return errored({ code: 'PLAYER_OPTED_OUT' });
  }

  if (player.annotations?.some(a => a.type === PlayerAnnotationType.BLOCKED)) {
    return errored({ code: 'PLAYER_IS_BLOCKED' });
  }

  if (player.status === PlayerStatus.ARCHIVED) {
    return errored({ code: 'PLAYER_IS_ARCHIVED' });
  }

  // If the player was updated recently, don't update it
  if (!shouldUpdate(player) && !isNew) {
    return errored({
      code: 'PLAYER_IS_RATE_LIMITED',
      lastUpdatedAt: player.updatedAt ?? new Date()
    });
  }

  const updatedPlayerFields: UpdatablePlayerFields = {
    ...(player.type !== PlayerType.IRONMAN
      ? {
          type: PlayerType.IRONMAN
        }
      : {})
  };

  // Fetch the previous player stats from the database
  const previousSnapshot = player.latestSnapshot;

  // Fetch the new player stats from the hiscores API
  const currentStatsResult = await fetchStats(player);

  if (isErrored(currentStatsResult)) {
    // If failed to load this player's stats from the hiscores, and they're not "regular" or "unknown"
    // we should at least check if their type has changed (e.g. the name was transfered to a regular acc)
    if (currentStatsResult.error.code === 'HISCORES_USERNAME_NOT_FOUND') {
      // If it failed to load their stats, and the player isn't unranked,
      // we should start a background job to check (a few times) if they're really unranked
      if (!isNew && player.status !== PlayerStatus.UNRANKED && player.status !== PlayerStatus.BANNED) {
        jobManager.add(JobType.CHECK_PLAYER_RANKED, { username: player.username });
      }
    }

    return currentStatsResult;
  }

  const currentStats = currentStatsResult.value;

  // There has been a significant change in this player's stats, mark it as flagged
  if (!skipFlagChecks && previousSnapshot && !snapshotUtils.withinRange(previousSnapshot, currentStats)) {
    return errored({ code: 'PLAYER_IS_FLAGGED' });
  }

  // The player has gained exp/kc/scores since the last update
  const hasChanged = !previousSnapshot || snapshotUtils.hasChanged(previousSnapshot, currentStats);

  const isFakeF2p = player.annotations?.some(a => a.type === PlayerAnnotationType.FAKE_F2P) ?? false;

  updatedPlayerFields.status = PlayerStatus.ACTIVE;
  updatedPlayerFields.build = getBuild(currentStats, isFakeF2p);

  const computedMetrics = await computePlayerMetrics(
    {
      id: player.id,
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

  // Add the computed metrics to the snapshot
  currentStats.ehpValue = computedMetrics.ehpValue;
  currentStats.ehpRank = computedMetrics.ehpRank;
  currentStats.ehbValue = computedMetrics.ehbValue;
  currentStats.ehbRank = computedMetrics.ehbRank;

  const newSnapshot = await prisma.snapshot.create({
    data: currentStats
  });

  updatedPlayerFields.updatedAt = newSnapshot.createdAt;
  updatedPlayerFields.latestSnapshotDate = newSnapshot.createdAt;

  if (hasChanged) {
    updatedPlayerFields.lastChangedAt = newSnapshot.createdAt;
  }

  const updatedPlayer = await prisma.player.update({
    data: updatedPlayerFields,
    where: { id: player.id }
  });

  eventEmitter.emit(EventType.PLAYER_UPDATED, {
    username: updatedPlayer.username,
    hasChanged,
    lastChangedAt: updatedPlayer.lastChangedAt,
    latestSnapshotDate: newSnapshot.createdAt,
    previousSnapshotDate: previousSnapshot?.createdAt ?? null
  });

  return complete({
    player: updatedPlayer,
    isNew
  });
}

async function fetchStats(player: Player): AsyncResult<Snapshot, HiscoresError> {
  const hiscoresResult = await fetchHiscoresJSON(player.username);

  if (isErrored(hiscoresResult)) {
    return hiscoresResult;
  }

  const newSnapshot = buildHiscoresSnapshot(player.id, hiscoresResult.value);

  return complete(newSnapshot);
}

async function findOrCreate(username: string): AsyncResult<
  {
    player: Player & { latestSnapshot?: Snapshot } & { annotations?: PlayerAnnotation[] };
    isNew: boolean;
  },
  {
    code: 'INVALID_USERNAME';
    subError: PlayerUsernameValidationError;
  }
> {
  const player = await prisma.player.findFirst({
    where: {
      username: standardizeUsername(username)
    },
    include: {
      annotations: true,
      latestSnapshot: true
    }
  });

  if (player) {
    // If this player's "latestSnapshot" isn't populated, fetch the latest snapshot from the DB
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

  const cleanUsername = standardizeUsername(username);
  const validationResult = validateUsername(cleanUsername);

  if (isErrored(validationResult)) {
    return errored({
      code: 'INVALID_USERNAME',
      subError: validationResult.error
    });
  }

  const newPlayer = await prisma.player.create({
    data: {
      username: cleanUsername,
      displayName: sanitizeDisplayName(username)
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
