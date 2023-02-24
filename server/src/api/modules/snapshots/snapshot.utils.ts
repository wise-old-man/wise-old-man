import {
  BOSSES,
  getMetricRankKey,
  getMetricValueKey,
  Metric,
  METRICS,
  COMPUTED_METRICS,
  ACTIVITIES,
  getLevel,
  SKILLS,
  MEMBER_SKILLS,
  F2P_BOSSES,
  MAX_SKILL_EXP,
  REAL_SKILLS,
  getCombatLevel,
  Skill,
  Boss,
  Activity,
  ComputedMetric,
  MapOf,
  MetricValueKey,
  Player
} from '../../../utils';
import { Snapshot } from '../../../prisma';
import { ServerError } from '../../errors';
import logger from '../../util/logging';
import * as efficiencyUtils from '../../modules/efficiency/efficiency.utils';
import { EfficiencyMap } from '../efficiency/efficiency.types';
import {
  ActivityValue,
  ActivityValueWithPlayer,
  BestGroupSnapshot,
  BossValue,
  BossValueWithPlayer,
  ComputedMetricValue,
  ComputedMetricValueWithPlayer,
  FormattedSnapshot,
  SkillValue,
  SkillValueWithPlayer
} from './snapshot.types';

function format(snapshot: Snapshot, efficiencyMap?: EfficiencyMap): FormattedSnapshot {
  if (!snapshot) return null;

  const { id, playerId, createdAt, importedAt } = snapshot;

  return {
    id,
    playerId,
    createdAt,
    importedAt,
    data: {
      skills: Object.fromEntries(
        SKILLS.map(s => {
          const experience = snapshot[getMetricValueKey(s)];

          const value: SkillValue = {
            metric: s,
            experience,
            rank: snapshot[getMetricRankKey(s)],
            level: s === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(experience)
          };

          if (efficiencyMap) {
            if (s === Metric.OVERALL) {
              value.ehp = snapshot.ehpValue;
            } else if (efficiencyMap[s] !== undefined) {
              value.ehp = efficiencyMap[s];
            }
          }

          return [s, value];
        })
      ) as MapOf<Skill, SkillValue>,
      bosses: Object.fromEntries(
        BOSSES.map(b => {
          const value: BossValue = {
            metric: b,
            kills: snapshot[getMetricValueKey(b)],
            rank: snapshot[getMetricRankKey(b)]
          };

          if (efficiencyMap && efficiencyMap[b] !== undefined) {
            value.ehb = efficiencyMap[b];
          }

          return [b, value];
        })
      ) as MapOf<Boss, BossValue>,
      activities: Object.fromEntries(
        ACTIVITIES.map(a => {
          return [
            a,
            {
              metric: a,
              score: snapshot[getMetricValueKey(a)],
              rank: snapshot[getMetricRankKey(a)]
            }
          ];
        })
      ) as MapOf<Activity, ActivityValue>,
      computed: Object.fromEntries(
        COMPUTED_METRICS.map(v => {
          return [
            v,
            {
              metric: v,
              value: snapshot[getMetricValueKey(v)],
              rank: snapshot[getMetricRankKey(v)]
            }
          ];
        })
      ) as MapOf<ComputedMetric, ComputedMetricValue>
    }
  };
}

/**
 * Decides whether two snapshots are within reasonable time/progress distance
 * of eachother. The difference between the two cannot be negative, or over the
 * EHP (maximum efficiency).
 */
function withinRange(before: Snapshot, after: Snapshot): boolean {
  // If this is the player's first snapshot
  if (!before) return true;

  if (!after) return false;

  const negativeGains = hasNegativeGains(before, after);
  const excessiveGains = hasExcessiveGains(before, after);

  const withinRange = !negativeGains && !excessiveGains;

  if (!withinRange) {
    logger.debug(`Flagged: id:${before.playerId} not within range`, { negativeGains, excessiveGains }, true);
  }

  return withinRange;
}

/**
 * Checks whether two snapshots have excessive gains in between.
 * This happens when the gained EHP and gained EHB combined are over
 * the ellapsed time between the two. This would have to mean this player
 * played at over maximum efficiency for the transition duration.
 */
function hasExcessiveGains(before: Snapshot, after: Snapshot): boolean {
  const afterDate = after.createdAt || new Date();
  const timeDiff = afterDate.getTime() - before.createdAt.getTime();

  const hoursDiff = Math.max(120, timeDiff / 1000 / 3600);

  const ehpDiff = efficiencyUtils.getPlayerEHP(after) - efficiencyUtils.getPlayerEHP(before);
  const ehbDiff = efficiencyUtils.getPlayerEHB(after) - efficiencyUtils.getPlayerEHB(before);

  return ehpDiff + ehbDiff > hoursDiff;
}

/**
 * Checks whether there has been gains between two snapshots
 */
function hasChanged(before: Snapshot, after: Snapshot): boolean {
  if (!before) return true;
  if (!after) return false;

  // EHP and EHB can fluctuate without the player's envolvement
  const metricsToIgnore = [Metric.EHP, Metric.EHB];
  const isValidKey = (key: MetricValueKey) => !metricsToIgnore.map(getMetricValueKey).includes(key);

  return METRICS.map(getMetricValueKey).some(k => isValidKey(k) && after[k] > -1 && after[k] > before[k]);
}

/**
 * Checks whether two snapshots have negative gains in between.
 */
function hasNegativeGains(before: Snapshot, after: Snapshot): boolean {
  // LMS scores, PVP ARENA scores, EHP and EHB can fluctuate overtime
  const metricsToIgnore = [Metric.EHP, Metric.EHB, Metric.LAST_MAN_STANDING, Metric.PVP_ARENA];
  const isValidKey = (key: MetricValueKey) => !metricsToIgnore.map(getMetricValueKey).includes(key);

  return METRICS.map(getMetricValueKey).some(k => isValidKey(k) && after[k] > -1 && after[k] < before[k]);
}

function average(snapshots: Snapshot[]): Snapshot {
  if (!snapshots || snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find average.');
  }

  const base = {
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

/**
 * Gets the best player/snapshot data for each metric.
 */
function getBestInEachMetric(snapshots: Snapshot[], players: Player[]): BestGroupSnapshot {
  if (!snapshots || snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find best players.');
  }

  if (!players || players.length !== snapshots.length) {
    throw new ServerError('Invalid players list. Failed to find best players.');
  }

  return {
    skills: Object.fromEntries(
      SKILLS.map(s => {
        const valueKey = getMetricValueKey(s);
        const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
        const experience = snapshot[valueKey];

        const value: SkillValueWithPlayer = {
          metric: s,
          experience,
          rank: snapshot[getMetricRankKey(s)],
          level: s === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(experience),
          player: players.find(p => p.id === snapshot.playerId)
        };

        return [s, value];
      })
    ) as MapOf<Skill, SkillValueWithPlayer>,
    bosses: Object.fromEntries(
      BOSSES.map(b => {
        const valueKey = getMetricValueKey(b);
        const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
        const kills = snapshot[valueKey];

        const value: BossValueWithPlayer = {
          metric: b,
          kills,
          rank: snapshot[getMetricRankKey(b)],
          player: players.find(p => p.id === snapshot.playerId)
        };

        return [b, value];
      })
    ) as MapOf<Boss, BossValueWithPlayer>,
    activities: Object.fromEntries(
      ACTIVITIES.map(a => {
        const valueKey = getMetricValueKey(a);
        const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
        const score = snapshot[valueKey];

        const value: ActivityValueWithPlayer = {
          metric: a,
          score,
          rank: snapshot[getMetricRankKey(a)],
          player: players.find(p => p.id === snapshot.playerId)
        };

        return [a, value];
      })
    ) as MapOf<Activity, ActivityValueWithPlayer>,
    computed: Object.fromEntries(
      COMPUTED_METRICS.map(c => {
        const valueKey = getMetricValueKey(c);
        const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
        const value = snapshot[valueKey];

        const metric: ComputedMetricValueWithPlayer = {
          metric: c,
          value,
          rank: snapshot[getMetricRankKey(c)],
          player: players.find(p => p.id === snapshot.playerId)
        };

        return [c, metric];
      })
    ) as MapOf<ComputedMetric, ComputedMetricValueWithPlayer>
  };
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
  return REAL_SKILLS.map(s => Math.min(snapshot[getMetricValueKey(s)], max)).reduce((acc, cur) => acc + cur);
}

function getTotalLevel(snapshot: Snapshot) {
  return REAL_SKILLS.map(s => getLevel(snapshot[getMetricValueKey(s)])).reduce((acc, cur) => acc + cur);
}

function isF2p(snapshot: Snapshot) {
  const hasMemberStats = MEMBER_SKILLS.some(s => getLevel(snapshot[getMetricValueKey(s)]) > 1);
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
  return getLevel(snapshot.defenceExperience) === 45;
}

export {
  format,
  average,
  hasChanged,
  hasExcessiveGains,
  hasNegativeGains,
  withinRange,
  isF2p,
  isZerker,
  is10HP,
  is1Def,
  isLvl3,
  getCappedExp,
  get200msCount,
  getMinimumExp,
  getTotalLevel,
  getCombatLevelFromSnapshot,
  getBestInEachMetric
};
