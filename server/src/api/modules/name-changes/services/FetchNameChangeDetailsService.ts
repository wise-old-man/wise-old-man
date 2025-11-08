import { AsyncResult, bindError, complete, errored, isComplete, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { fetchHiscoresJSON, HiscoresData, HiscoresError } from '../../../../services/jagex.service';
import { NameChange, NameChangeStatus, PlayerBuild, PlayerType } from '../../../../types';
import { assertNever } from '../../../../utils/assert-never.util';
import {
  formatNameChangeResponse,
  formatSnapshotResponse,
  NameChangeDetailsResponse
} from '../../../responses';
import { getPlayerEfficiencyMap } from '../../efficiency/efficiency.utils';
import { computePlayerMetrics } from '../../efficiency/services/ComputePlayerMetricsService';
import { standardize } from '../../players/player.utils';
import { buildHiscoresSnapshot } from '../../snapshots/services/BuildHiscoresSnapshot';
import { getNegativeGains } from '../../snapshots/snapshot.utils';

async function fetchNameChangeDetails(id: number): AsyncResult<
  NameChangeDetailsResponse,
  | { code: 'NAME_CHANGE_NOT_FOUND' }
  | { code: 'OLD_STATS_NOT_FOUND' }
  | {
      code: 'FAILED_TO_LOAD_HISCORES';
      subError: Exclude<HiscoresError, { code: 'HISCORES_USERNAME_NOT_FOUND' }>;
    }
> {
  const nameChange = await prisma.nameChange.findFirst({
    where: { id }
  });

  if (nameChange === null) {
    return errored({ code: 'NAME_CHANGE_NOT_FOUND' } as const);
  }

  const oldPlayer = await prisma.player.findFirst({
    where: { username: standardize(nameChange.oldName) }
  });

  const newPlayer = await prisma.player.findFirst({
    where: { username: standardize(nameChange.newName) }
  });

  if (!oldPlayer || nameChange.status !== NameChangeStatus.PENDING) {
    return complete({
      nameChange: nameChange as NameChange
    });
  }

  // Attempt to fetch hiscores data for the new name
  // if they can't be found on the regular hiscores, fallback to trying the ironman hiscores
  // before asserting that the new name is not on the hiscores at all
  const newHiscoresResult = await fetchHiscoresWithFallback(nameChange.newName).then(result =>
    bindError(result, error => {
      switch (error.code) {
        case 'HISCORES_USERNAME_NOT_FOUND':
          return complete(null);
        case 'HISCORES_SERVICE_UNAVAILABLE':
        case 'HISCORES_UNEXPECTED_ERROR':
          return errored({ code: 'FAILED_TO_LOAD_HISCORES', subError: error } as const);
        default:
          assertNever(error);
      }
    })
  );

  if (isErrored(newHiscoresResult)) {
    return newHiscoresResult;
  }

  const oldHiscoresResult = await fetchHiscoresJSON(nameChange.oldName).then(result =>
    bindError(result, error => {
      switch (error.code) {
        case 'HISCORES_USERNAME_NOT_FOUND':
          return complete(null);
        case 'HISCORES_SERVICE_UNAVAILABLE':
        case 'HISCORES_UNEXPECTED_ERROR':
          return errored({ code: 'FAILED_TO_LOAD_HISCORES', subError: error } as const);
        default:
          assertNever(error);
      }
    })
  );

  if (isErrored(oldHiscoresResult)) {
    return oldHiscoresResult;
  }

  // Fetch the last snapshot from the old name
  const oldStats = await prisma.snapshot.findFirst({
    where: { playerId: oldPlayer.id },
    orderBy: { createdAt: 'desc' }
  });

  if (!oldStats) {
    return errored({
      code: 'OLD_STATS_NOT_FOUND'
    });
  }

  // Fetch either the first snapshot of the new name, or the current hiscores stats
  // Note: this playerId isn't needed, and won't be used or exposed to the user
  let newStats = newHiscoresResult.value === null ? null : buildHiscoresSnapshot(1, newHiscoresResult.value);

  if (newPlayer) {
    // If the new name is already a tracked player and was tracked
    // since the old name's last snapshot, use this first "post change"
    // snapshot as a starting point
    const postChangeSnapshot = await prisma.snapshot.findFirst({
      where: {
        playerId: newPlayer.id,
        createdAt: { gt: oldStats.createdAt }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    if (postChangeSnapshot) {
      newStats = postChangeSnapshot;
    }
  }

  const afterDate = newStats ? newStats.createdAt : new Date();
  const timeDiff = afterDate.getTime() - oldStats.createdAt.getTime();
  const hoursDiff = timeDiff / 1000 / 60 / 60;

  const oldPlayerComputedMetrics = await computePlayerMetrics(
    {
      id: -1,
      type: PlayerType.REGULAR,
      build: PlayerBuild.MAIN
    },
    oldStats
  );

  oldStats.ehpValue = oldPlayerComputedMetrics.ehpValue;
  oldStats.ehpRank = oldPlayerComputedMetrics.ehpRank;

  oldStats.ehbValue = oldPlayerComputedMetrics.ehbValue;
  oldStats.ehbRank = oldPlayerComputedMetrics.ehbRank;

  // If new stats cannot be found on the hiscores or our database, there's nothing to compare oldStats to.
  if (!newStats) {
    return complete({
      nameChange: formatNameChangeResponse(nameChange as NameChange),
      data: {
        isNewOnHiscores: newHiscoresResult.value !== null,
        isOldOnHiscores: oldHiscoresResult.value !== null,
        isNewTracked: newPlayer !== null,
        negativeGains: null,
        hasNegativeGains: false,
        timeDiff,
        hoursDiff,
        ehpDiff: 0,
        ehbDiff: 0,
        oldStats: formatSnapshotResponse(oldStats, getPlayerEfficiencyMap(oldStats, oldPlayer)),
        newStats: null
      }
    });
  }

  const newPlayerComputedMetrics = await computePlayerMetrics(
    {
      id: -1,
      type: PlayerType.REGULAR,
      build: PlayerBuild.MAIN
    },
    newStats
  );

  newStats.ehpValue = newPlayerComputedMetrics.ehpValue;
  newStats.ehpRank = newPlayerComputedMetrics.ehpRank;
  newStats.ehbValue = newPlayerComputedMetrics.ehbValue;
  newStats.ehbRank = newPlayerComputedMetrics.ehbRank;

  const negativeGains = getNegativeGains(oldStats, newStats);

  return complete({
    nameChange: nameChange as NameChange,
    data: {
      isNewOnHiscores: newHiscoresResult.value !== null,
      isOldOnHiscores: oldHiscoresResult.value !== null,
      isNewTracked: newPlayer !== null,
      negativeGains,
      hasNegativeGains: negativeGains !== null,
      timeDiff,
      hoursDiff,
      ehpDiff: newStats.ehpValue - oldStats.ehpValue,
      ehbDiff: newStats.ehbValue - oldStats.ehbValue,
      oldStats: formatSnapshotResponse(oldStats, getPlayerEfficiencyMap(oldStats, oldPlayer)),
      newStats: formatSnapshotResponse(newStats, getPlayerEfficiencyMap(newStats, newPlayer ?? oldPlayer))
    }
  });
}

async function fetchHiscoresWithFallback(username: string): AsyncResult<HiscoresData, HiscoresError> {
  const regularHiscoresDataResult = await fetchHiscoresJSON(username);

  if (isComplete(regularHiscoresDataResult)) {
    return regularHiscoresDataResult;
  }

  switch (regularHiscoresDataResult.error.code) {
    case 'HISCORES_USERNAME_NOT_FOUND':
      // If not found on the regular hiscores, fallback to trying the ironman hiscores instead
      return fetchHiscoresJSON(username, PlayerType.IRONMAN);
    case 'HISCORES_UNEXPECTED_ERROR':
    case 'HISCORES_SERVICE_UNAVAILABLE':
      return regularHiscoresDataResult;
    default:
      assertNever(regularHiscoresDataResult.error);
  }
}

export { fetchNameChangeDetails };
