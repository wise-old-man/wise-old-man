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
import {
  ActivityValue,
  ActivityValueWithPlayer,
  BossValue,
  BossValueWithPlayer,
  ComputedMetricValue,
  ComputedMetricValueWithPlayer,
  FormattedSnapshot,
  MetricLeaders,
  SkillValue,
  SkillValueWithPlayer
} from './snapshot.types';

// On this date, the Bounty Hunter was updated and scores were reset.
const BOUNTY_HUNTER_UPDATE_DATE = new Date('2023-05-24T10:30:00.000Z');

function format(snapshot: Snapshot, efficiencyMap?: Map<Skill | Boss, number>): FormattedSnapshot {
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

          if (efficiencyMap && efficiencyMap.get(s) !== undefined) {
            value.ehp = efficiencyMap.get(s);
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

          if (efficiencyMap && efficiencyMap.get(b) !== undefined) {
            value.ehb = efficiencyMap.get(b);
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

  const negativeGains = !!getNegativeGains(before, after);
  const excessiveGains = !!getExcessiveGains(before, after);

  const withinRange = !negativeGains && !excessiveGains;

  if (!withinRange) {
    logger.debug(`Flagged: id:${before.playerId} not within range`, { negativeGains, excessiveGains }, true);
  }

  return withinRange;
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
 * Checks whether two snapshots have excessive gains in between.
 * This happens when the gained EHP and gained EHB combined are over
 * the ellapsed time between the two. This would have to mean this player
 * played at over maximum efficiency for the transition duration.
 */
function getExcessiveGains(before: Snapshot, after: Snapshot) {
  const afterDate = after.createdAt || new Date();
  const timeDiff = afterDate.getTime() - before.createdAt.getTime();

  const hoursDiff = Math.max(120, timeDiff / 1000 / 3600);

  const ehpDiff = efficiencyUtils.getPlayerEHP(after) - efficiencyUtils.getPlayerEHP(before);
  const ehbDiff = efficiencyUtils.getPlayerEHB(after) - efficiencyUtils.getPlayerEHB(before);

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

  const isValidKey = (key: MetricValueKey) => !metricsToIgnore.map(getMetricValueKey).includes(key);

  const negativeMetrics = METRICS.filter(metric => {
    const valueKey = getMetricValueKey(metric);
    return isValidKey(valueKey) && after[valueKey] > -1 && after[valueKey] < before[valueKey];
  });

  if (negativeMetrics.length === 0) return null;

  const negativeGains = Object.fromEntries(
    negativeMetrics.map(metric => {
      const valueKey = getMetricValueKey(metric);
      return [metric, after[valueKey] - before[valueKey]];
    })
  ) as MapOf<Metric, number>;

  return negativeGains;
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
 * Assigns the player property of each metric leader from the given players
 * array using the leader id map to lookup leaders player id.
 *
 * The player field will be left null, if the leader had a rank of -1.
 * This indicates there was no actual leader.
 */
function assignPlayersToMetricLeaders(
  leaders: MetricLeaders,
  leaderIdMap: Map<Metric, number>,
  players: Player[]
): void {
  const playerMap = new Map<number, Player>();
  players.forEach(p => playerMap.set(p.id, p));

  const assignPlayer = (
    leader:
      | SkillValueWithPlayer
      | BossValueWithPlayer
      | ComputedMetricValueWithPlayer
      | ActivityValueWithPlayer
  ) => {
    if (leader.rank > -1) {
      leader.player = playerMap.get(leaderIdMap.get(leader.metric));
    }
  };

  Object.values(leaders.skills).forEach(assignPlayer);
  Object.values(leaders.bosses).forEach(assignPlayer);
  Object.values(leaders.computed).forEach(assignPlayer);
  Object.values(leaders.activities).forEach(assignPlayer);
}

/**
 * Gets the metric leaders for each metric from the given snapshots.
 *
 * The `player` field will be null, you are expected to assign those yourself.
 * See helper function `assignPlayersToMetricLeaders`.
 *
 * @returns the metric leaders and a mapping of metric to the leaders player id.
 */
function getMetricLeaders(snapshots: Snapshot[]) {
  if (!snapshots || snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find metric leaders.');
  }

  const leaderIdMap = new Map<Metric, number>();
  const metricLeaders = {
    skills: Object.fromEntries(
      SKILLS.map(s => {
        const valueKey = getMetricValueKey(s);
        const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
        const experience = snapshot[valueKey];

        if (experience > -1) {
          leaderIdMap.set(s, snapshot.playerId);
        }

        const value: SkillValueWithPlayer = {
          metric: s,
          experience,
          rank: snapshot[getMetricRankKey(s)],
          level: s === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(experience),
          player: null
        };

        return [s, value];
      })
    ),
    bosses: Object.fromEntries(
      BOSSES.map(b => {
        const valueKey = getMetricValueKey(b);
        const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
        const kills = snapshot[valueKey];

        if (kills > -1) {
          leaderIdMap.set(b, snapshot.playerId);
        }

        const value: BossValueWithPlayer = {
          metric: b,
          kills,
          rank: snapshot[getMetricRankKey(b)],
          player: null
        };

        return [b, value];
      })
    ),
    activities: Object.fromEntries(
      ACTIVITIES.map(a => {
        const valueKey = getMetricValueKey(a);
        const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
        const score = snapshot[valueKey];

        if (score > -1) {
          leaderIdMap.set(a, snapshot.playerId);
        }

        const value: ActivityValueWithPlayer = {
          metric: a,
          score,
          rank: snapshot[getMetricRankKey(a)],
          player: null
        };

        return [a, value];
      })
    ),
    computed: Object.fromEntries(
      COMPUTED_METRICS.map(c => {
        const valueKey = getMetricValueKey(c);
        const snapshot = [...snapshots].sort((x, y) => y[valueKey] - x[valueKey])[0];
        const value = snapshot[valueKey];

        if (value > -1) {
          leaderIdMap.set(c, snapshot.playerId);
        }

        const metric: ComputedMetricValueWithPlayer = {
          metric: c,
          value,
          rank: snapshot[getMetricRankKey(c)],
          player: null
        };

        return [c, metric];
      })
    )
  } as MetricLeaders;

  return { metricLeaders, leaderIdMap };
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
  format,
  average,
  hasChanged,
  getExcessiveGains,
  getNegativeGains,
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
  getMetricLeaders,
  assignPlayersToMetricLeaders
};
