import {
  ACTIVITIES,
  Activity,
  Boss,
  BOSSES,
  COMPUTED_METRICS,
  ComputedMetric,
  Metric,
  Player,
  Skill,
  SKILLS,
  Snapshot
} from '../../../types';
import { MetricDelta } from '../../../types/metric-delta.type';

import { getMetricRankKey } from '../../../utils/get-metric-rank-key.util';
import { getMetricValueKey } from '../../../utils/get-metric-value-key.util';

import { getLevel, getMinimumValue, isSkill } from '../../../utils/shared';
import { roundNumber } from '../../../utils/shared/round-number.util';
import {
  getPlayerEfficiencyMap,
  getPlayerEHB,
  getPlayerEHP
} from '../../modules/efficiency/efficiency.utils';
import { PlayerDeltasMapResponse } from '../../responses';
import { getTotalLevel } from '../snapshots/snapshot.utils';

const EMPTY_PROGRESS = Object.freeze({ start: 0, end: 0, gained: 0 }) satisfies MetricDelta;

/**
 * Calculates the rank difference between two snapshots, for a given metric.
 * This function also takes into account negative ranks (unranked).
 *
 * Example:
 * - Starting Snapshot: Attack Rank: 45,636
 * - Ending Snapshot: Attack Rank: 57,331
 * - Output: { start: 45636, end:  57331, gained: 11695 }
 */
function calculateRankDiff(metric: Metric, startSnapshot: Snapshot, endSnapshot: Snapshot) {
  const rankKey = getMetricRankKey(metric);

  const startRank: number = startSnapshot[rankKey] || -1;
  const endRank: number = endSnapshot[rankKey] || -1;

  // Do not use initial ranks for skill, to prevent -1 ranks from creating crazy diffs
  // (introduced by https://github.com/wise-old-man/wise-old-man/pull/93)
  const gainedRank = isSkill(metric) && startSnapshot[rankKey] === -1 ? 0 : endRank - Math.max(0, startRank);

  return {
    gained: gainedRank,
    start: startRank,
    end: endRank
  };
}

/**
 * Calculates the value (exp, kills, etc) difference between two snapshots, for a given metric.
 * This function also takes into account negative values (unranked) and minimum boss kcs.
 *
 * Example (skills):
 * - Starting Snapshot: Cooking Exp: 8,756,484
 * - Ending Snapshot: Cooking Exp: 9,456,596
 * - Output: { start: 8756484, end:  9456596, gained: 700112 }
 *
 * Example (unranked boss):
 * - Starting Snapshot: Zulrah KC: -1
 * - Ending Snapshot: Zulrah KC: 73
 * - Output: { start: -1, end:  73, gained: 24 }
 *
 * Example (unranked overall):
 * - Starting Snapshot: Overall Exp: -1
 * - Ending Snapshot: OverallExp: 5,566,255
 * - Output: { start: -1, end:  5566255, gained: 0 }
 */
export function calculateValueDiff(metric: Metric, startSnapshot: Snapshot, endSnapshot: Snapshot) {
  const minimumValue = getMinimumValue(metric);
  const valueKey = getMetricValueKey(metric);

  const startValue = startSnapshot && startSnapshot[valueKey] ? startSnapshot[valueKey] : -1;
  const endValue = endSnapshot && endSnapshot[valueKey] ? endSnapshot[valueKey] : -1;

  let gainedValue = roundNumber(
    Math.max(0, endValue - (startValue === -1 ? Math.max(0, minimumValue - 1) : startValue)),
    5
  );

  // Some players with low total level (but high exp) can sometimes fall off the hiscores
  // causing their starting exp to be -1, this would then cause the diff to think
  // that their entire ranked exp has just been gained (by jumping from -1 to 40m, for example)
  if (metric === Metric.OVERALL && startValue === -1) {
    gainedValue = 0;
  }

  return {
    gained: gainedValue,
    start: startValue,
    end: endValue
  };
}

/**
 * Calculates the efficiency (ehp/ehb) difference between two snapshots, for a given metric.
 */
function calculateEfficiencyDiff(
  metric: Skill | Boss,
  startMap: Map<Skill | Boss, number>,
  endMap: Map<Skill | Boss, number>
) {
  // Calculate EHP/EHB diffs
  const startEfficiency = startMap.get(metric)!;
  const endEfficiency = endMap.get(metric)!;

  return {
    gained: roundNumber(endEfficiency - startEfficiency, 5),
    start: startEfficiency,
    end: endEfficiency
  };
}

/**
 * Calculates the total EHP difference between two snapshots.
 */
function calculateEHPDiff(startSnapshot: Snapshot, endSnapshot: Snapshot, player: Player) {
  const startEHP = startSnapshot ? getPlayerEHP(startSnapshot, player) : 0;
  const endEHP = endSnapshot ? getPlayerEHP(endSnapshot, player) : 0;

  return {
    gained: Math.max(0, roundNumber(endEHP - startEHP, 5)),
    start: startEHP,
    end: endEHP
  };
}

/**
 * Calculates the total EHB difference between two snapshots.
 */
function calculateEHBDiff(startSnapshot: Snapshot, endSnapshot: Snapshot, player: Player) {
  const startEHB = startSnapshot ? getPlayerEHB(startSnapshot, player) : 0;
  const endEHB = endSnapshot ? getPlayerEHB(endSnapshot, player) : 0;

  return {
    gained: Math.max(0, roundNumber(endEHB - startEHB, 5)),
    start: startEHB,
    end: endEHB
  };
}

/**
 * Calculates the level difference between two snapshots, for a given skill.
 *
 * If the given skill is "overall", then it will calculate total levels from both snapshots,
 * by summing the levels of each individual skill.
 */
export function calculateLevelDiff(
  metric: Metric,
  startSnapshot: Snapshot,
  endSnapshot: Snapshot,
  valueDiff: MetricDelta
) {
  if (metric === Metric.OVERALL) {
    const startTotalLevel = getTotalLevel(startSnapshot);
    const endTotalLevel = getTotalLevel(endSnapshot);

    return {
      gained: Math.max(0, endTotalLevel - startTotalLevel),
      start: startTotalLevel,
      end: endTotalLevel
    };
  }

  const startLevel = getLevel(valueDiff.start);
  const endLevel = getLevel(valueDiff.end);

  return {
    gained: Math.max(0, endLevel - startLevel),
    start: startLevel,
    end: endLevel
  };
}

/**
 * Calculates the value delta for a given metric.
 * Useful for calculating diffs for competitions and group deltas.
 */
export function calculateMetricDelta(
  player: Player,
  metric: Metric,
  startSnapshot: Snapshot,
  endSnapshot: Snapshot
) {
  if (metric === Metric.EHP) return calculateEHPDiff(startSnapshot, endSnapshot, player);
  if (metric === Metric.EHB) return calculateEHBDiff(startSnapshot, endSnapshot, player);
  return calculateValueDiff(metric, startSnapshot, endSnapshot);
}

/**
 * Calculates the complete deltas for a given player (and snapshots)
 */
export function calculatePlayerDeltas(
  startSnapshot: Snapshot,
  endSnapshot: Snapshot,
  player: Player
): PlayerDeltasMapResponse {
  const startEfficiencyMap = getPlayerEfficiencyMap(startSnapshot, player);
  const endEfficiencyMap = getPlayerEfficiencyMap(endSnapshot, player);

  function calculateSkillDelta(skill: Skill) {
    const valueDiff = calculateValueDiff(skill, startSnapshot, endSnapshot);

    return {
      metric: skill,
      experience: valueDiff,
      ehp: calculateEfficiencyDiff(skill, startEfficiencyMap, endEfficiencyMap),
      rank: calculateRankDiff(skill, startSnapshot, endSnapshot),
      level: calculateLevelDiff(skill, startSnapshot, endSnapshot, valueDiff)
    };
  }

  function calculateBossDelta(boss: Boss) {
    return {
      metric: boss,
      ehb: calculateEfficiencyDiff(boss, startEfficiencyMap, endEfficiencyMap),
      rank: calculateRankDiff(boss, startSnapshot, endSnapshot),
      kills: calculateValueDiff(boss, startSnapshot, endSnapshot)
    };
  }

  function calculateActivityDelta(activity: Activity) {
    return {
      metric: activity,
      rank: calculateRankDiff(activity, startSnapshot, endSnapshot),
      score: calculateValueDiff(activity, startSnapshot, endSnapshot)
    };
  }

  function calculateComputedMetricDelta(computedMetric: ComputedMetric) {
    const valueDiff =
      computedMetric === Metric.EHP
        ? calculateEHPDiff(startSnapshot, endSnapshot, player)
        : calculateEHBDiff(startSnapshot, endSnapshot, player);

    return {
      metric: computedMetric,
      value: valueDiff,
      rank: calculateRankDiff(computedMetric, startSnapshot, endSnapshot)
    };
  }

  const deltas = {
    skills: Object.fromEntries(
      SKILLS.map(s => [s, calculateSkillDelta(s)])
    ) as PlayerDeltasMapResponse['skills'],
    bosses: Object.fromEntries(
      BOSSES.map(b => [b, calculateBossDelta(b)])
    ) as PlayerDeltasMapResponse['bosses'],
    activities: Object.fromEntries(
      ACTIVITIES.map(a => [a, calculateActivityDelta(a)])
    ) as PlayerDeltasMapResponse['activities'],
    computed: Object.fromEntries(
      COMPUTED_METRICS.map(v => [v, calculateComputedMetricDelta(v)])
    ) as PlayerDeltasMapResponse['computed']
  };

  // Special Handling for Overall EHP
  deltas.skills.overall.ehp = deltas.computed.ehp.value;

  return deltas;
}

export function emptyPlayerDelta(): PlayerDeltasMapResponse {
  return {
    skills: Object.fromEntries(
      SKILLS.map(skill => [
        skill,
        {
          metric: skill,
          ehp: EMPTY_PROGRESS,
          rank: EMPTY_PROGRESS,
          level: EMPTY_PROGRESS,
          experience: EMPTY_PROGRESS
        }
      ])
    ) as PlayerDeltasMapResponse['skills'],
    bosses: Object.fromEntries(
      BOSSES.map(boss => [
        boss,
        {
          metric: boss,
          ehb: EMPTY_PROGRESS,
          rank: EMPTY_PROGRESS,
          kills: EMPTY_PROGRESS
        }
      ])
    ) as PlayerDeltasMapResponse['bosses'],
    activities: Object.fromEntries(
      ACTIVITIES.map(activity => [
        activity,
        {
          metric: activity,
          rank: EMPTY_PROGRESS,
          score: EMPTY_PROGRESS
        }
      ])
    ) as PlayerDeltasMapResponse['activities'],
    computed: Object.fromEntries(
      COMPUTED_METRICS.map(computedMetric => [
        computedMetric,
        {
          metric: computedMetric,
          rank: EMPTY_PROGRESS,
          value: EMPTY_PROGRESS
        }
      ])
    ) as PlayerDeltasMapResponse['computed']
  };
}
