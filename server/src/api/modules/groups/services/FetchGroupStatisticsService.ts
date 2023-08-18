import { z } from 'zod';
import prisma from '../../../../prisma';
import { PlayerBuild, PlayerType } from '../../../../utils';
import { NotFoundError, BadRequestError } from '../../../errors';
import * as efficiencyUtils from '../../efficiency/efficiency.utils';
import {
  get200msCount,
  format,
  average,
  getCombatLevelFromSnapshot,
  getTotalLevel,
  getMetricLeaders,
  assignPlayersToMetricLeaders
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

  const players = (
    await prisma.player.findMany({
      where: {
        id: { in: memberships.map(m => m.playerId) }
      },
      include: {
        latestSnapshot: true
      }
    })
  ).filter(p => !!p.latestSnapshot);

  if (!players || players.length === 0) {
    throw new BadRequestError("Couldn't find any stats for this group.");
  }

  const maxedCombatCount = players.filter(p => {
    return getCombatLevelFromSnapshot(p.latestSnapshot) === 126;
  }).length;

  const maxedTotalCount = players.filter(p => {
    return getTotalLevel(p.latestSnapshot) === 2277;
  }).length;

  const maxed200msCount = players
    .map(p => get200msCount(p.latestSnapshot))
    .reduce((acc, cur) => acc + cur, 0);

  const averageSnapshot = average(players.map(p => p.latestSnapshot));

  const averageEfficiencyMap = efficiencyUtils.getPlayerEfficiencyMap(averageSnapshot, {
    type: PlayerType.REGULAR,
    build: PlayerBuild.MAIN
  });

  const averageStats = format(averageSnapshot, averageEfficiencyMap);

  const { metricLeaders, leaderIdMap } = getMetricLeaders(players.map(p => p.latestSnapshot));
  const leaderIds = [...new Set(leaderIdMap.values())];

  assignPlayersToMetricLeaders(
    metricLeaders,
    leaderIdMap,
    players.filter(p => leaderIds.includes(p.id))
  );

  return { maxedCombatCount, maxedTotalCount, maxed200msCount, averageStats, metricLeaders };
}

export { fetchGroupStatistics };
