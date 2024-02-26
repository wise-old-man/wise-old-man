import prisma from '../../../../prisma';
import {
  ACTIVITIES,
  BOSSES,
  COMPUTED_METRICS,
  Metric,
  MetricLeaders,
  Player,
  PlayerBuild,
  PlayerType,
  SKILLS,
  Snapshot,
  getLevel,
  getMetricRankKey,
  getMetricValueKey
} from '../../../../utils';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import { getPlayerEfficiencyMap } from '../../efficiency/efficiency.utils';
import {
  average,
  formatSnapshot,
  get200msCount,
  getCombatLevelFromSnapshot,
  getTotalLevel
} from '../../snapshots/snapshot.utils';
import { GroupStatistics } from '../group.types';

async function fetchGroupStatistics(groupId: number): Promise<GroupStatistics> {
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
  const maxedTotalCount = allSnapshots.filter(s => getTotalLevel(s) === 2277).length;
  const maxed200msCount = allSnapshots.map(s => get200msCount(s)).reduce((acc, cur) => acc + cur, 0);

  const averageSnapshot = average(allSnapshots);

  const averageEfficiencyMap = getPlayerEfficiencyMap(averageSnapshot, {
    type: PlayerType.REGULAR,
    build: PlayerBuild.MAIN
  });

  const averageStats = formatSnapshot(averageSnapshot, averageEfficiencyMap);

  // @ ts-expect-error -- Remove latestSnapshot to prevent it from leaking in the API response
  players.forEach(p => delete p.latestSnapshot);

  const metricLeaders = await getMetricLeaders(players, allSnapshots);

  return { maxedCombatCount, maxedTotalCount, maxed200msCount, averageStats, metricLeaders };
}

async function getMetricLeaders(players: Player[], snapshots: Snapshot[]) {
  if (!snapshots || snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find metric leaders.');
  }

  const playerMap = new Map<number, Player>(players.map(p => [p.id, p]));

  const metricLeaders = { skills: {}, bosses: {}, activities: {}, computed: {} };

  for (const skill of SKILLS) {
    const valueKey = getMetricValueKey(skill);

    const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
    const experience = snapshot[valueKey];

    metricLeaders.skills[skill] = {
      metric: skill,
      experience,
      rank: snapshot[getMetricRankKey(skill)],
      level: skill === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(experience),
      player: experience > -1 ? playerMap.get(snapshot.playerId) : null
    };
  }

  for (const boss of BOSSES) {
    const valueKey = getMetricValueKey(boss);

    const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
    const kills = snapshot[valueKey];

    metricLeaders.bosses[boss] = {
      metric: boss,
      kills,
      rank: snapshot[getMetricRankKey(boss)],
      player: kills > -1 ? playerMap.get(snapshot.playerId) : null
    };
  }

  for (const activity of ACTIVITIES) {
    const valueKey = getMetricValueKey(activity);

    const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
    const score = snapshot[valueKey];

    metricLeaders.activities[activity] = {
      metric: activity,
      score,
      rank: snapshot[getMetricRankKey(activity)],
      player: score > -1 ? playerMap.get(snapshot.playerId) : null
    };
  }

  for (const computedMetric of COMPUTED_METRICS) {
    const valueKey = getMetricValueKey(computedMetric);
    const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
    const val = snapshot[valueKey];

    metricLeaders.computed[computedMetric] = {
      metric: computedMetric,
      value: val,
      rank: snapshot[getMetricRankKey(computedMetric)],
      player: val > -1 ? playerMap.get(snapshot.playerId) : null
    };
  }

  return metricLeaders as MetricLeaders;
}

export { fetchGroupStatistics };
