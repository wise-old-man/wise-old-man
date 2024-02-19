import { PlayerType } from '../../../../utils';
import prisma, { NameChangeStatus } from '../../../../prisma';
import { NotFoundError, ServerError } from '../../../errors';
import * as jagexService from '../../../services/external/jagex.service';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import { NameChange, NameChangeDetails } from '../name-change.types';
import { standardize } from '../../players/player.utils';
import { computePlayerMetrics } from '../../efficiency/services/ComputePlayerMetricsService';
import { getPlayerEfficiencyMap } from '../../efficiency/efficiency.utils';
import { findPlayerSnapshot } from '../../snapshots/services/FindPlayerSnapshotService';
import { buildSnapshot } from '../../snapshots/services/BuildSnapshotService';
import { formatSnapshot } from '../../snapshots/snapshot.utils';

async function fetchNameChangeDetails(id: number): Promise<NameChangeDetails> {
  const nameChange = await prisma.nameChange.findFirst({ where: { id } });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  const oldPlayer = await prisma.player.findFirst({
    where: { username: standardize(nameChange.oldName) }
  });

  const newPlayer = await prisma.player.findFirst({
    where: { username: standardize(nameChange.newName) }
  });

  if (!oldPlayer || nameChange.status !== NameChangeStatus.PENDING) {
    return { nameChange: nameChange as NameChange };
  }

  let newHiscores;
  let oldHiscores;

  try {
    // Attempt to fetch hiscores data for the new name
    // if they can't be found on the regular hiscores, fallback to trying the ironman and FSW hiscores
    // before asserting that the new name is not on the hiscores at all
    newHiscores = await fetchHiscoresWithFallback(nameChange.newName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
  }

  try {
    oldHiscores = await jagexService.fetchHiscoresData(nameChange.oldName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
  }

  // Fetch the last snapshot from the old name
  const oldStats = await findPlayerSnapshot({ id: oldPlayer.id });

  if (!oldStats) {
    throw new ServerError('Old stats could not be found.');
  }

  // Fetch either the first snapshot of the new name, or the current hiscores stats
  // Note: this playerId isn't needed, and won't be used or exposed to the user
  let newStats = newHiscores ? await buildSnapshot(1, newHiscores) : null;

  if (newPlayer) {
    // If the new name is already a tracked player and was tracked
    // since the old name's last snapshot, use this first "post change"
    // snapshot as a starting point
    const postChangeSnapshot = await findPlayerSnapshot({
      id: newPlayer.id,
      minDate: oldStats.createdAt
    });

    if (postChangeSnapshot) {
      newStats = postChangeSnapshot;
    }
  }

  const afterDate = newStats && newStats.createdAt ? newStats.createdAt : new Date();
  const timeDiff = afterDate.getTime() - oldStats.createdAt.getTime();
  const hoursDiff = timeDiff / 1000 / 60 / 60;

  const oldPlayerComputedMetrics = await computePlayerMetrics(oldPlayer, oldStats);
  const newPlayerComputedMetrics = await computePlayerMetrics(newPlayer || { ...oldPlayer, id: 1 }, newStats);

  oldStats.ehpValue = oldPlayerComputedMetrics.ehpValue;
  oldStats.ehpRank = oldPlayerComputedMetrics.ehpRank;

  oldStats.ehbValue = oldPlayerComputedMetrics.ehbValue;
  oldStats.ehbRank = oldPlayerComputedMetrics.ehbRank;

  if (newPlayerComputedMetrics) {
    newStats.ehpValue = newPlayerComputedMetrics.ehpValue;
    newStats.ehpRank = newPlayerComputedMetrics.ehpRank;
    newStats.ehbValue = newPlayerComputedMetrics.ehbValue;
    newStats.ehbRank = newPlayerComputedMetrics.ehbRank;
  }

  const ehpDiff = newStats ? newStats.ehpValue - oldStats.ehpValue : 0;
  const ehbDiff = newStats ? newStats.ehbValue - oldStats.ehbValue : 0;

  const negativeGains = newStats ? snapshotUtils.getNegativeGains(oldStats, newStats) : null;

  const oldPlayerEfficiencyMap = getPlayerEfficiencyMap(oldStats, oldPlayer);
  const newPlayerEfficiencyMap = getPlayerEfficiencyMap(newStats, newPlayer);

  if (!newPlayer && newStats) {
    delete newStats.playerId;
  }

  return {
    nameChange: nameChange as NameChange,
    data: {
      isNewOnHiscores: !!newHiscores,
      isOldOnHiscores: !!oldHiscores,
      isNewTracked: !!newPlayer,
      negativeGains,
      hasNegativeGains: !!negativeGains,
      timeDiff,
      hoursDiff,
      ehpDiff,
      ehbDiff,
      oldStats: formatSnapshot(oldStats, oldPlayerEfficiencyMap),
      newStats: formatSnapshot(newStats, newPlayerEfficiencyMap)
    }
  };
}

async function fetchHiscoresWithFallback(username: string) {
  // Try fetching from the regular hiscores
  try {
    return await jagexService.fetchHiscoresData(username);
  } catch (error) {
    if (error instanceof ServerError) throw error;
  }

  // If the regular hiscores failed, try the ironman hiscores
  try {
    return await jagexService.fetchHiscoresData(username, PlayerType.IRONMAN);
  } catch (error) {
    if (error instanceof ServerError) throw error;
  }

  return undefined;
}

export { fetchNameChangeDetails };
