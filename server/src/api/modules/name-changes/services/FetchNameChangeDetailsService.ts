import { z } from 'zod';
import prisma, { NameChangeStatus } from '../../../../prisma';
import { PlayerType, PlayerBuild } from '../../../../utils';
import { NotFoundError, ServerError } from '../../../errors';
import * as jagexService from '../../../services/external/jagex.service';
import * as snapshotServices from '../../snapshots/snapshot.services';
import * as playerServices from '../../players/player.services';
import * as snapshotUtils from '../../snapshots/snapshot.utils';
import * as efficiencyUtils from '../../efficiency/efficiency.utils';
import * as efficiencyServices from '../../efficiency/efficiency.services';
import { NameChangeDetails } from '../name-change.types';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type FetchetailsParams = z.infer<typeof inputSchema>;

async function fetchNameChangeDetails(payload: FetchetailsParams): Promise<NameChangeDetails> {
  const params = inputSchema.parse(payload);

  const nameChange = await prisma.nameChange.findFirst({ where: { id: params.id } });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  const [oldPlayer] = await playerServices.findPlayer({ username: nameChange.oldName });
  const [newPlayer] = await playerServices.findPlayer({ username: nameChange.newName });

  if (!oldPlayer || nameChange.status !== NameChangeStatus.PENDING) {
    return { nameChange };
  }

  let newHiscores;
  let oldHiscores;

  try {
    // Attempt to fetch hiscores data for the new name
    newHiscores = await jagexService.getHiscoresData(nameChange.newName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
  }

  try {
    oldHiscores = await jagexService.getHiscoresData(nameChange.oldName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
  }

  // Fetch the last snapshot from the old name
  const oldStats = await snapshotServices.findPlayerSnapshot({ id: oldPlayer.id });

  if (!oldStats) {
    throw new ServerError('Old stats could not be found.');
  }

  // Fetch either the first snapshot of the new name, or the current hiscores stats
  // Note: this playerId isn't needed, and won't be used or exposed to the user
  let newStats = newHiscores
    ? await snapshotServices.buildSnapshot({ playerId: 1, rawCSV: newHiscores })
    : null;

  if (newPlayer) {
    // If the new name is already a tracked player and was tracked
    // since the old name's last snapshot, use this first "post change"
    // snapshot as a starting point
    const postChangeSnapshot = await snapshotServices.findPlayerSnapshot({
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

  const oldPlayerComputedMetrics = await efficiencyServices.computePlayerMetrics({
    player: oldPlayer,
    snapshot: oldStats
  });

  const newPlayerComputedMetrics = await efficiencyServices.computePlayerMetrics({
    player: newPlayer || { id: 1, type: PlayerType.REGULAR, build: PlayerBuild.MAIN },
    snapshot: newStats
  });

  oldStats.ehpValue = oldPlayerComputedMetrics.ehpValue;
  oldStats.ehpRank = oldPlayerComputedMetrics.ehpRank;

  oldStats.ehbValue = oldPlayerComputedMetrics.ehbValue;
  oldStats.ehbRank = oldPlayerComputedMetrics.ehbRank;

  newStats.ehpValue = newPlayerComputedMetrics.ehpValue;
  newStats.ehpRank = newPlayerComputedMetrics.ehpRank;

  newStats.ehbValue = newPlayerComputedMetrics.ehbValue;
  newStats.ehbRank = newPlayerComputedMetrics.ehbRank;

  const ehpDiff = newStats ? newStats.ehpValue - oldStats.ehpValue : 0;
  const ehbDiff = newStats ? newStats.ehbValue - oldStats.ehbValue : 0;

  const hasNegativeGains = newStats ? snapshotUtils.hasNegativeGains(oldStats, newStats) : false;

  const oldPlayerEfficiencyMap = efficiencyUtils.getPlayerEfficiencyMap(oldStats, oldPlayer);
  const newPlayerEfficiencyMap = efficiencyUtils.getPlayerEfficiencyMap(newStats, newPlayer);

  if (!newPlayer) {
    delete newStats.playerId;
  }

  return {
    nameChange,
    data: {
      isNewOnHiscores: !!newHiscores,
      isOldOnHiscores: !!oldHiscores,
      isNewTracked: !!newPlayer,
      hasNegativeGains,
      timeDiff,
      hoursDiff,
      ehpDiff,
      ehbDiff,
      oldStats: snapshotUtils.format(oldStats, oldPlayerEfficiencyMap),
      newStats: snapshotUtils.format(newStats, newPlayerEfficiencyMap)
    }
  };
}

export { fetchNameChangeDetails };
