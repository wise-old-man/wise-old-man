import prisma from '../../../../prisma';
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  Metric,
  Player,
  PlayerBuild,
  PlayerType,
  SKILLS,
  Snapshot
} from '../../../../types';
import { getMetricRankKey } from '../../../../utils/get-metric-rank-key.util';
import { getMetricValueKey } from '../../../../utils/get-metric-value-key.util';
import { getLevel, REAL_SKILLS } from '../../../../utils/shared';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import {
  formatPlayerResponse,
  formatSnapshotResponse,
  GroupMetricLeadersResponse,
  GroupStatisticsResponse
} from '../../../responses';
import { getPlayerEfficiencyMap } from '../../efficiency/efficiency.utils';
import {
  average,
  get200msCount,
  getCombatLevelFromSnapshot,
  getTotalLevel
} from '../../snapshots/snapshot.utils';

async function fetchGroupStatistics(groupId: number): Promise<GroupStatisticsResponse> {
  const memberships = await prisma.membership.findMany({
    where: { groupId }
  });

  if (!memberships || memberships.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
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

  const allSnapshots = players.map(p => p.latestSnapshot).filter(Boolean);

  if (!players || players.length === 0) {
    throw new BadRequestError("Couldn't find any stats for this group.");
  }

  const maxedCombatCount = allSnapshots.filter(s => getCombatLevelFromSnapshot(s) === 126).length;
  const maxedTotalCount = allSnapshots.filter(s => getTotalLevel(s) === REAL_SKILLS.length * 99).length;
  const maxed200msCount = allSnapshots.map(s => get200msCount(s)).reduce((acc, cur) => acc + cur, 0);

  const averageSnapshot = average(allSnapshots);

  const averageEfficiencyMap = getPlayerEfficiencyMap(averageSnapshot, {
    type: PlayerType.REGULAR,
    build: PlayerBuild.MAIN
  });

  const metricLeaders = await getMetricLeaders(players, allSnapshots);

  return {
    maxedCombatCount,
    maxedTotalCount,
    maxed200msCount,
    averageStats: formatSnapshotResponse(averageSnapshot, averageEfficiencyMap),
    metricLeaders
  };
}

async function getMetricLeaders(
  players: Player[],
  snapshots: Snapshot[]
): Promise<GroupMetricLeadersResponse> {
  if (!snapshots || snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find metric leaders.');
  }

  const playerMap = new Map<number, Player>(players.map(p => [p.id, p]));

  const metricLeaders = {
    skills: {},
    bosses: {},
    activities: {},
    computed: {}
  } as GroupMetricLeadersResponse;

  for (const skill of SKILLS) {
    const valueKey = getMetricValueKey(skill);

    const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
    const experience = snapshot[valueKey];

    const player = experience > -1 ? playerMap.get(snapshot.playerId) || null : null;

    metricLeaders.skills[skill] = {
      metric: skill,
      experience,
      rank: snapshot[getMetricRankKey(skill)],
      level: skill === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(experience),
      player: player === null ? null : formatPlayerResponse(player)
    };
  }

  for (const boss of BOSSES) {
    const valueKey = getMetricValueKey(boss);

    const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
    const kills = snapshot[valueKey];

    const player = kills > -1 ? playerMap.get(snapshot.playerId) || null : null;

    metricLeaders.bosses[boss] = {
      metric: boss,
      kills,
      rank: snapshot[getMetricRankKey(boss)],
      player: player === null ? null : formatPlayerResponse(player)
    };
  }

  for (const activity of ACTIVITIES) {
    const valueKey = getMetricValueKey(activity);

    const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
    const score = snapshot[valueKey];

    const player = score > -1 ? playerMap.get(snapshot.playerId) || null : null;

    metricLeaders.activities[activity] = {
      metric: activity,
      score,
      rank: snapshot[getMetricRankKey(activity)],
      player: player === null ? null : formatPlayerResponse(player)
    };
  }

  for (const computedMetric of COMPUTED_METRICS) {
    const valueKey = getMetricValueKey(computedMetric);
    const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
    const val = snapshot[valueKey];

    const player = val > -1 ? playerMap.get(snapshot.playerId) || null : null;

    metricLeaders.computed[computedMetric] = {
      metric: computedMetric,
      value: val,
      rank: snapshot[getMetricRankKey(computedMetric)],
      player: player === null ? null : formatPlayerResponse(player)
    };
  }

  return metricLeaders;
}

export { fetchGroupStatistics };
