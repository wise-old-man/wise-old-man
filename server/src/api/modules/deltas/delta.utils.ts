import {
  isSkill,
  isVirtualMetric,
  Metric,
  getMinimumBossKc,
  getMetricRankKey,
  getMetricValueKey,
  round,
  getLevel
} from '@wise-old-man/utils';
import { getTotalLevel } from '../../util/experience';
import {
  Snapshot,
  Player,
  Skills,
  Bosses,
  Activities,
  Virtuals,
  MetricEnum,
  SkillEnum,
  BossEnum,
  ActivityEnum,
  VirtualEnum
} from '../../../prisma';
import * as efficiencyUtils from '../../modules/efficiency/efficiency.utils';
import {
  ActivityDelta,
  BossDelta,
  MeasuredDeltaProgress,
  PlayerDeltasArray,
  PlayerDeltasMap,
  SkillDelta,
  VirtualDelta
} from './delta.types';
import { EfficiencyMap } from '../efficiency/efficiency.types';

const EMPTY_PROGRESS = Object.freeze({ start: 0, end: 0, gained: 0 });

export function parseNum(metric: MetricEnum, val: string) {
  return isVirtualMetric(metric as Metric) ? parseFloat(val) : parseInt(val);
}

export function flattenPlayerDeltas(deltas: PlayerDeltasMap): PlayerDeltasArray {
  return {
    skills: Object.values(deltas.skills),
    bosses: Object.values(deltas.bosses),
    activities: Object.values(deltas.activities),
    virtuals: Object.values(deltas.virtuals)
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
function calculateRankDiff(metric: MetricEnum, startSnapshot: Snapshot, endSnapshot: Snapshot) {
  const rankKey = getMetricRankKey(metric as Metric);

  const startRank: number = startSnapshot[rankKey] || -1;
  const endRank: number = endSnapshot[rankKey] || -1;

  // Do not use initial ranks for skill, to prevent -1 ranks from creating crazy diffs
  // (introduced by https://github.com/wise-old-man/wise-old-man/pull/93)
  const gainedRank =
    isSkill(metric as Metric) && startSnapshot[rankKey] === -1 ? 0 : endRank - Math.max(0, startRank);

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
function calculateValueDiff(metric: MetricEnum, startSnapshot: Snapshot, endSnapshot: Snapshot) {
  const minimumValue = getMinimumBossKc(metric as Metric);
  const valueKey = getMetricValueKey(metric as Metric);

  const startValue = parseNum(metric, startSnapshot[valueKey] || -1);
  const endValue = parseNum(metric, endSnapshot[valueKey] || -1);

  let gainedValue = round(Math.max(0, endValue - Math.max(0, minimumValue - 1, startValue)), 5);

  // Some players with low total level (but high exp) can sometimes fall off the hiscores
  // causing their starting exp to be -1, this would then cause the diff to think
  // that their entire ranked exp has just been gained (by jumping from -1 to 40m, for example)
  if (metric === MetricEnum.OVERALL && startValue === -1) gainedValue = 0;

  return {
    gained: gainedValue,
    start: startValue,
    end: endValue
  };
}

/**
 * Calculates the efficiency (ehp/ehb) difference between two snapshots, for a given metric.
 */
function calculateEfficiencyDiff(metric: MetricEnum, startMap: EfficiencyMap, endMap: EfficiencyMap) {
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
  const startEHP = efficiencyUtils.getPlayerEHP(startSnapshot, player);
  const endEHP = efficiencyUtils.getPlayerEHP(endSnapshot, player);

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
  const startEHB = efficiencyUtils.getPlayerEHB(startSnapshot, player);
  const endEHB = efficiencyUtils.getPlayerEHB(endSnapshot, player);

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
  metric: MetricEnum,
  startSnapshot: Snapshot,
  endSnapshot: Snapshot,
  valueDiff: MeasuredDeltaProgress
) {
  if (metric === MetricEnum.OVERALL) {
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
  metric: MetricEnum,
  startSnapshot: Snapshot,
  endSnapshot: Snapshot
) {
  if (metric === MetricEnum.EHP) return calculateEHPDiff(startSnapshot, endSnapshot, player);
  if (metric === MetricEnum.EHB) return calculateEHBDiff(startSnapshot, endSnapshot, player);
  return calculateValueDiff(metric, startSnapshot, endSnapshot);
}

/**
 * Calculates the complete deltas for a given player (and snapshots)
 */
export function calculatePlayerDeltas(startSnapshot: Snapshot, endSnapshot: Snapshot, player: Player) {
  const startEfficiencyMap = efficiencyUtils.getPlayerEfficiencyMap(startSnapshot, player);
  const endEfficiencyMap = efficiencyUtils.getPlayerEfficiencyMap(endSnapshot, player);

  function calculateSkillDelta(skill: SkillEnum): SkillDelta {
    const valueDiff = calculateValueDiff(skill, startSnapshot, endSnapshot);

    return {
      metric: skill,
      experience: valueDiff,
      ehp: calculateEfficiencyDiff(skill, startEfficiencyMap, endEfficiencyMap),
      rank: calculateRankDiff(skill, startSnapshot, endSnapshot),
      level: calculateLevelDiff(skill, startSnapshot, endSnapshot, valueDiff)
    };
  }

  function calculateBossDelta(boss: BossEnum): BossDelta {
    return {
      metric: boss,
      ehb: calculateEfficiencyDiff(boss, startEfficiencyMap, endEfficiencyMap),
      rank: calculateRankDiff(boss, startSnapshot, endSnapshot),
      kills: calculateValueDiff(boss, startSnapshot, endSnapshot)
    };
  }

  function calculateActivityDelta(activity: ActivityEnum): ActivityDelta {
    return {
      metric: activity,
      rank: calculateRankDiff(activity, startSnapshot, endSnapshot),
      score: calculateValueDiff(activity, startSnapshot, endSnapshot)
    };
  }

  function calculateVirtualDelta(virtual: VirtualEnum): VirtualDelta {
    const valueDiff =
      virtual === VirtualEnum.EHP
        ? calculateEHPDiff(startSnapshot, endSnapshot, player)
        : calculateEHBDiff(startSnapshot, endSnapshot, player);

    return {
      metric: virtual,
      value: valueDiff,
      rank: calculateRankDiff(virtual, startSnapshot, endSnapshot)
    };
  }

  const deltas: PlayerDeltasMap = {
    skills: Object.fromEntries(Skills.map(s => [s, calculateSkillDelta(s)])),
    bosses: Object.fromEntries(Bosses.map(b => [b, calculateBossDelta(b)])),
    activities: Object.fromEntries(Activities.map(a => [a, calculateActivityDelta(a)])),
    virtuals: Object.fromEntries(Virtuals.map(v => [v, calculateVirtualDelta(v)]))
  };

  // Special Handling for Overall EHP
  deltas.skills.overall.ehp = deltas.virtuals.ehp.value;

  return deltas;
}

export function emptyPlayerDelta(): PlayerDeltasArray {
  return {
    skills: Skills.map(skill => ({
      metric: skill,
      ehp: EMPTY_PROGRESS,
      rank: EMPTY_PROGRESS,
      level: EMPTY_PROGRESS,
      experience: EMPTY_PROGRESS
    })),
    bosses: Bosses.map(boss => ({
      metric: boss,
      ehb: EMPTY_PROGRESS,
      rank: EMPTY_PROGRESS,
      kills: EMPTY_PROGRESS
    })),
    activities: Activities.map(activity => ({
      metric: activity,
      rank: EMPTY_PROGRESS,
      score: EMPTY_PROGRESS
    })),
    virtuals: Virtuals.map(virtual => ({
      metric: virtual,
      rank: EMPTY_PROGRESS,
      value: EMPTY_PROGRESS
    }))
  };
}
