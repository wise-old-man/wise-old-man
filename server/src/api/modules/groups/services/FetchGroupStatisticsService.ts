import { z } from 'zod';
import prisma from '../../../../prisma';
import { PlayerBuild, PlayerType } from '../../../../utils';
import { NotFoundError, BadRequestError } from '../../../errors';
import * as playerServices from '../../players/player.services';
import * as snapshotServices from '../../snapshots/snapshot.services';
import * as efficiencyUtils from '../../efficiency/efficiency.utils';
import {
  get200msCount,
  format,
  average,
  getCombatLevelFromSnapshot,
  getTotalLevel,
  getBestInEachMetric
} from '../../snapshots/snapshot.utils';
import { GroupStatistics } from '../group.types';

const inputSchema = z.object({
  id: z.number().positive()
});

type FetchGroupStatisticsParams = z.infer<typeof inputSchema>;

async function fetchGroupStatistics(payload: FetchGroupStatisticsParams): Promise<GroupStatistics> {
  const params = inputSchema.parse(payload);

  const memberships = await prisma.membership.findMany({
    where: { groupId: params.id }
  });

  if (!memberships || memberships.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: params.id }
    });

    if (!group) {
      throw new NotFoundError('Group not found.');
    }

    throw new BadRequestError("Couldn't find any stats for this group.");
  }

  const snapshots = await snapshotServices.findGroupSnapshots({
    playerIds: memberships.map(m => m.playerId),
    maxDate: new Date()
  });

  if (!snapshots || snapshots.length === 0) {
    throw new BadRequestError("Couldn't find any stats for this group.");
  }

  const maxedCombatCount = snapshots.filter(s => getCombatLevelFromSnapshot(s) === 126).length;
  const maxedTotalCount = snapshots.filter(s => getTotalLevel(s) === 2277).length;
  const maxed200msCount = snapshots.map(s => get200msCount(s)).reduce((acc, cur) => acc + cur, 0);

  const averageSnapshot = average(snapshots);

  const averageEfficiencyMap = efficiencyUtils.getPlayerEfficiencyMap(averageSnapshot, {
    type: PlayerType.REGULAR,
    build: PlayerBuild.MAIN
  });

  const averageStats = format(averageSnapshot, averageEfficiencyMap);
  const players = await playerServices.findPlayers({ ids: snapshots.map(s => s.playerId) });
  const best = getBestInEachMetric(snapshots, players);

  return { maxedCombatCount, maxedTotalCount, maxed200msCount, averageStats, best };
}

export { fetchGroupStatistics };
