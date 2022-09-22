import { Snapshot, Player } from '../../../prisma';
import {
  getLevel,
  SKILLS,
  BOSSES,
  ACTIVITIES,
  COMPUTED_METRICS,
  Metric,
  Skill,
  Boss,
  Activity,
  ComputedMetric,
  isSkill,
  isComputedMetric,
  getMinimumBossKc,
  getMetricRankKey,
  getMetricValueKey,
  round
} from '../../../utils';
import * as efficiencyUtils from '../../modules/efficiency/efficiency.utils';
import {
  ActivityDelta,
  BossDelta,
  MeasuredDeltaProgress,
  PlayerDeltasArray,
  PlayerDeltasMap,
  SkillDelta,
  ComputedMetricDelta
} from './delta.types';
import { EfficiencyMap } from '../efficiency/efficiency.types';
import { getTotalLevel } from '../snapshots/snapshot.utils';

const EMPTY_PROGRESS = Object.freeze({ start: 0, end: 0, gained: 0 });

export function parseNum(metric: Metric, val: string) {
  return isComputedMetric(metric) ? parseFloat(val) : parseInt(val);
}

export function flattenPlayerDeltas(deltas: PlayerDeltasMap): PlayerDeltasArray {
  return {
    skills: Object.values(deltas.skills),
    bosses: Object.values(deltas.bosses),
    activities: Object.values(deltas.activities),
    computed: Object.values(deltas.computed)
  };
}

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
 * Example (unranked boss, min kc = 50):
 * - Starting Snapshot: Zulrah KC: -1
 * - Ending Snapshot: Zulrah KC: 73
 * - Output: { start: -1, end:  73, gained: 24 }
 *
 * Example (unranked overall):
 * - Starting Snapshot: Overall Exp: -1
 * - Ending Snapshot: OverallExp: 5,566,255
 * - Output: { start: -1, end:  5566255, gained: 0 }
 */
function calculateValueDiff(metric: Metric, startSnapshot: Snapshot, endSnapshot: Snapshot) {
  const minimumValue = getMinimumBossKc(metric);
  const valueKey = getMetricValueKey(metric);

  const startValue = parseNum(
    metric,
    startSnapshot && startSnapshot[valueKey] ? startSnapshot[valueKey] : -1
  );

  const endValue = parseNum(metric, endSnapshot && endSnapshot[valueKey] ? endSnapshot[valueKey] : -1);

  let gainedValue = round(Math.max(0, endValue - Math.max(0, minimumValue - 1, startValue)), 5);

  // Some players with low total level (but high exp) can sometimes fall off the hiscores
  // causing their starting exp to be -1, this would then cause the diff to think
  // that their entire ranked exp has just been gained (by jumping from -1 to 40m, for example)
  if (metric === Metric.OVERALL && startValue === -1) gainedValue = 0;

  return {
    gained: gainedValue,
    start: startValue,
    end: endValue
  };
}

/**
 * Calculates the efficiency (ehp/ehb) difference between two snapshots, for a given metric.
 */
function calculateEfficiencyDiff(metric: Metric, startMap: EfficiencyMap, endMap: EfficiencyMap) {
  // Calculate EHP/EHB diffs
  const startEfficiency = startMap[metric];
  const endEfficiency = endMap[metric];

  return {
    gained: round(endEfficiency - startEfficiency, 5),
    start: startEfficiency,
    end: endEfficiency
  };
}

/**
 * Calculates the total EHP difference between two snapshots.
 */
function calculateEHPDiff(startSnapshot: Snapshot, endSnapshot: Snapshot, player: Player) {
  const startEHP = startSnapshot ? efficiencyUtils.getPlayerEHP(startSnapshot, player) : 0;
  const endEHP = endSnapshot ? efficiencyUtils.getPlayerEHP(endSnapshot, player) : 0;

  return {
    gained: Math.max(0, round(endEHP - startEHP, 5)),
    start: startEHP,
    end: endEHP
  };
}

/**
 * Calculates the total EHB difference between two snapshots.
 */
function calculateEHBDiff(startSnapshot: Snapshot, endSnapshot: Snapshot, player: Player) {
  const startEHB = startSnapshot ? efficiencyUtils.getPlayerEHB(startSnapshot, player) : 0;
  const endEHB = endSnapshot ? efficiencyUtils.getPlayerEHB(endSnapshot, player) : 0;

  return {
    gained: Math.max(0, round(endEHB - startEHB, 5)),
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
function calculateLevelDiff(
  metric: Metric,
  startSnapshot: Snapshot,
  endSnapshot: Snapshot,
  valueDiff: MeasuredDeltaProgress
) {
  if (metric === Metric.OVERALL) {
    const startTotalLevel = getTotalLevel(startSnapshot as any);
    const endTotalLevel = getTotalLevel(endSnapshot as any);

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
export function calculatePlayerDeltas(startSnapshot: Snapshot, endSnapshot: Snapshot, player: Player) {
  const startEfficiencyMap = efficiencyUtils.getPlayerEfficiencyMap(startSnapshot, player);
  const endEfficiencyMap = efficiencyUtils.getPlayerEfficiencyMap(endSnapshot, player);

  function calculateSkillDelta(skill: Skill): SkillDelta {
    const valueDiff = calculateValueDiff(skill, startSnapshot, endSnapshot);

    return {
      metric: skill,
      experience: valueDiff,
      ehp: calculateEfficiencyDiff(skill, startEfficiencyMap, endEfficiencyMap),
      rank: calculateRankDiff(skill, startSnapshot, endSnapshot),
      level: calculateLevelDiff(skill, startSnapshot, endSnapshot, valueDiff)
    };
  }

  function calculateBossDelta(boss: Boss): BossDelta {
    return {
      metric: boss,
      ehb: calculateEfficiencyDiff(boss, startEfficiencyMap, endEfficiencyMap),
      rank: calculateRankDiff(boss, startSnapshot, endSnapshot),
      kills: calculateValueDiff(boss, startSnapshot, endSnapshot)
    };
  }

  function calculateActivityDelta(activity: Activity): ActivityDelta {
    return {
      metric: activity,
      rank: calculateRankDiff(activity, startSnapshot, endSnapshot),
      score: calculateValueDiff(activity, startSnapshot, endSnapshot)
    };
  }

  function calculateComputedMetricDelta(computedMetric: ComputedMetric): ComputedMetricDelta {
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

  const deltas: PlayerDeltasMap = {
    skills: Object.fromEntries(SKILLS.map(s => [s, calculateSkillDelta(s)])),
    bosses: Object.fromEntries(BOSSES.map(b => [b, calculateBossDelta(b)])),
    activities: Object.fromEntries(ACTIVITIES.map(a => [a, calculateActivityDelta(a)])),
    computed: Object.fromEntries(COMPUTED_METRICS.map(v => [v, calculateComputedMetricDelta(v)]))
  };

  // Special Handling for Overall EHP
  deltas.skills.overall.ehp = deltas.computed.ehp.value;

  return deltas;
}

export function emptyPlayerDelta(): PlayerDeltasArray {
  return {
    skills: SKILLS.map(skill => ({
      metric: skill,
      ehp: EMPTY_PROGRESS,
      rank: EMPTY_PROGRESS,
      level: EMPTY_PROGRESS,
      experience: EMPTY_PROGRESS
    })),
    bosses: BOSSES.map(boss => ({
      metric: boss,
      ehb: EMPTY_PROGRESS,
      rank: EMPTY_PROGRESS,
      kills: EMPTY_PROGRESS
    })),
    activities: ACTIVITIES.map(activity => ({
      metric: activity,
      rank: EMPTY_PROGRESS,
      score: EMPTY_PROGRESS
    })),
    computed: COMPUTED_METRICS.map(computedMetric => ({
      metric: computedMetric,
      rank: EMPTY_PROGRESS,
      value: EMPTY_PROGRESS
    }))
  };
}
