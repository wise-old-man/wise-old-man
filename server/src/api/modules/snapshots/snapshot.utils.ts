import { BOSSES, Metric, METRICS, Skill, Snapshot } from '../../../types';
import { getMetricRankKey } from '../../../utils/get-metric-rank-key.util';
import { getMetricValueKey, MetricValueKey } from '../../../utils/get-metric-value-key.util';
import {
  F2P_BOSSES,
  getCombatLevel,
  getLevel,
  MAX_SKILL_EXP,
  MEMBER_SKILLS,
  REAL_SKILLS
} from '../../../utils/shared';
import { ServerError } from '../../errors';
import { getPlayerEHB, getPlayerEHP } from '../../modules/efficiency/efficiency.utils';

// These metrics were added to the hiscores long after their in-game release,
// causing players to go from unranked to very high values in a single update.
export const POST_RELEASE_HISCORE_ADDITIONS = [
  Metric.COLLECTIONS_LOGGED,
  Metric.SPINDEL,
  Metric.CALVARION,
  Metric.ARTIO
];

// On this date, the Bounty Hunter was updated and scores were reset.
const BOUNTY_HUNTER_UPDATE_DATE = new Date('2023-05-24T10:30:00.000Z');

/**
 * Decides whether two snapshots are within reasonable time/progress distance
 * of eachother. The difference between the two cannot be negative, or over the
 * EHP (maximum efficiency).
 */
function withinRange(before: Snapshot, after: Snapshot): boolean {
  return !getNegativeGains(before, after) && !getExcessiveGains(before, after);
}

/**
 * Checks whether there has been gains between two snapshots
 */
function hasChanged(before: Snapshot, after: Snapshot): boolean {
  // EHP and EHB can fluctuate without the player's envolvement
  const metricsToIgnore = [Metric.EHP, Metric.EHB];
  const isValidKey = (key: MetricValueKey<Metric>) => !metricsToIgnore.map(getMetricValueKey).includes(key);

  return METRICS.map(getMetricValueKey).some(k => isValidKey(k) && after[k] > -1 && after[k] > before[k]);
}

/**
 * Checks whether two snapshots have excessive gains in between.
 * This happens when the gained EHP and gained EHB combined are over
 * the ellapsed time between the two. This would have to mean this player
 * played at over maximum efficiency for the transition duration.
 */
function getExcessiveGains(before: Snapshot, after: Snapshot) {
  const afterDate = after.createdAt || new Date();
  const timeDiff = afterDate.getTime() - before.createdAt.getTime();

  const hoursDiff = Math.max(120, timeDiff / 1000 / 3600);

  const ehpDiff = getPlayerEHP(after) - getPlayerEHP(before);
  const ehbDiff = getPlayerEHB(after) - getPlayerEHB(before);

  if (ehpDiff + ehbDiff <= hoursDiff) return null;

  return { ehpDiff, ehbDiff, hoursDiff };
}

function getNegativeGains(before: Snapshot, after: Snapshot) {
  // LMS scores, PVP ARENA scores, EHP and EHB can fluctuate overtime
  const metricsToIgnore: Metric[] = [Metric.EHP, Metric.EHB, Metric.LAST_MAN_STANDING, Metric.PVP_ARENA];

  // The Bounty Hunter game update on May 24th 2023 reset people's BH scores, so if this game update happened
  // in between the two snapshots, we should also ignore BH score negative gains.
  if (before.createdAt < BOUNTY_HUNTER_UPDATE_DATE && after.createdAt > BOUNTY_HUNTER_UPDATE_DATE) {
    metricsToIgnore.push(Metric.BOUNTY_HUNTER_HUNTER, Metric.BOUNTY_HUNTER_ROGUE);
  }

  const negativeMetrics = METRICS.filter(metric => {
    if (metricsToIgnore.includes(metric)) {
      return false;
    }

    const valueKey = getMetricValueKey(metric);

    return after[valueKey] > -1 && after[valueKey] < before[valueKey];
  });

  if (negativeMetrics.length === 0) return null;

  const negativeGains = Object.fromEntries(
    negativeMetrics.map(metric => {
      const valueKey = getMetricValueKey(metric);
      return [metric, Math.max(0, after[valueKey]) - Math.max(0, before[valueKey])];
    })
  ) as Record<Metric, number>;

  return negativeGains;
}

function average(snapshots: Snapshot[]): Snapshot {
  if (!snapshots || snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find average.');
  }

  const base: Partial<Snapshot> = {
    id: -1,
    playerId: -1,
    importedAt: null,
    createdAt: new Date()
  };

  METRICS.forEach(metric => {
    const valueKey = getMetricValueKey(metric);
    const rankKey = getMetricRankKey(metric);

    const valueSum = snapshots.map(s => s[valueKey]).reduce((acc, cur) => acc + cur, 0);
    const rankSum = snapshots.map(s => s[rankKey]).reduce((acc, cur) => acc + cur, 0);

    const valueAvg = Math.round(valueSum / snapshots.length);
    const rankAvg = Math.round(rankSum / snapshots.length);

    base[valueKey] = valueAvg;
    base[rankKey] = rankAvg;
  });

  return base as Snapshot;
}

function getCombatLevelFromSnapshot(snapshot: Snapshot) {
  if (!snapshot) return 3;

  return getCombatLevel(
    getLevel(snapshot.attackExperience),
    getLevel(snapshot.strengthExperience),
    getLevel(snapshot.defenceExperience),
    getLevel(snapshot.rangedExperience),
    getLevel(snapshot.magicExperience),
    getLevel(snapshot.hitpointsExperience),
    getLevel(snapshot.prayerExperience)
  );
}

function get200msCount(snapshot: Snapshot) {
  return REAL_SKILLS.filter(s => snapshot[getMetricValueKey(s)] === MAX_SKILL_EXP).length;
}

function getMinimumExp(snapshot: Snapshot) {
  return REAL_SKILLS.map(s => Math.max(0, snapshot[getMetricValueKey(s)] || 0)).sort((a, b) => a - b)[0];
}

function getCappedExp(snapshot: Snapshot, max: number) {
  return REAL_SKILLS.map(s => Math.min(snapshot[getMetricValueKey(s)], max)).reduce(
    (acc, cur) => acc + Math.max(cur, 0)
  );
}

function getTotalLevel(snapshot: Snapshot) {
  let totalLevelSum = 0;

  for (const skill of REAL_SKILLS) {
    const level = getLevel(snapshot[getMetricValueKey(skill)]);
    const minLevel = skill === Skill.HITPOINTS ? 10 : 1;

    totalLevelSum += Math.max(level, minLevel);
  }

  return Math.max(snapshot.overallLevel ?? -1, totalLevelSum);
}

function isF2p(snapshot: Snapshot) {
  const hasMemberStats = MEMBER_SKILLS.some(s => snapshot[getMetricValueKey(s)] > 0);
  const hasBossKc = BOSSES.filter(b => !F2P_BOSSES.includes(b)).some(b => snapshot[getMetricValueKey(b)] > 0);

  return !hasMemberStats && !hasBossKc;
}

function isLvl3(snapshot: Snapshot) {
  return getCombatLevelFromSnapshot(snapshot) <= 3;
}

function is1Def(snapshot: Snapshot) {
  return getLevel(snapshot.defenceExperience) === 1;
}

function is10HP(snapshot: Snapshot) {
  return getCombatLevelFromSnapshot(snapshot) > 3 && getLevel(snapshot.hitpointsExperience) === 10;
}

function isZerker(snapshot: Snapshot) {
  const defLvl = getLevel(snapshot.defenceExperience);
  return defLvl >= 40 && defLvl <= 45;
}

export {
  average,
  get200msCount,
  getCappedExp,
  getCombatLevelFromSnapshot,
  getExcessiveGains,
  getMinimumExp,
  getNegativeGains,
  getTotalLevel,
  hasChanged,
  is10HP,
  is1Def,
  isF2p,
  isLvl3,
  isZerker,
  withinRange
};
