import { AsyncResult, complete, errored } from '@attio/fetchable';
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

export async function fetchGroupStatistics(
  groupId: number
): AsyncResult<GroupStatisticsResponse, { code: 'GROUP_NOT_FOUND' } | { code: 'GROUP_HAS_NO_MEMBERS' }> {
  const memberships = await prisma.membership.findMany({
    where: { groupId }
  });

  if (memberships.length === 0) {
    const group = await prisma.group.findFirst({
      where: { id: groupId }
    });

    if (group === null) {
      return errored({ code: 'GROUP_NOT_FOUND' });
    }

    return errored({ code: 'GROUP_HAS_NO_MEMBERS' });
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

  if (players.length === 0) {
    return errored({ code: 'GROUP_HAS_NO_MEMBERS' });
  }

  const maxedCombatCount = allSnapshots.filter(s => getCombatLevelFromSnapshot(s) === 126).length;
  const maxedTotalCount = allSnapshots.filter(s => getTotalLevel(s) === REAL_SKILLS.length * 99).length;
  const maxed200msCount = allSnapshots.map(s => get200msCount(s)).reduce((acc, cur) => acc + cur, 0);

  const averageSnapshot = average(allSnapshots);

  const averageEfficiencyMap = getPlayerEfficiencyMap(averageSnapshot, {
    type: PlayerType.REGULAR,
    build: PlayerBuild.MAIN
  });

  return complete({
    maxedCombatCount,
    maxedTotalCount,
    maxed200msCount,
    averageStats: formatSnapshotResponse(averageSnapshot, averageEfficiencyMap),
    metricLeaders: getMetricLeaders(players, allSnapshots)
  });
}

function getMetricLeaders(players: Player[], snapshots: Snapshot[]): GroupMetricLeadersResponse {
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
