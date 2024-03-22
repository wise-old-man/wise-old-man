import csv from 'csvtojson';
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
  MetricValueKey
} from '../../../utils';
import { Snapshot } from '../../../prisma';
import { ServerError } from '../../errors';
import logger from '../../util/logging';
import { getPlayerEHP, getPlayerEHB } from '../../modules/efficiency/efficiency.utils';
import {
  ActivityValue,
  BossValue,
  ComputedMetricValue,
  FormattedSnapshot,
  SkillValue
} from './snapshot.types';

// Skip Deadman Points and Legacy Bounty Hunter (hunter/rogue)
export const SKIPPED_ACTIVITY_INDICES = [1, 4, 5];

// On this date, the Bounty Hunter was updated and scores were reset.
const BOUNTY_HUNTER_UPDATE_DATE = new Date('2023-05-24T10:30:00.000Z');

async function parseHiscoresSnapshot(playerId: number, rawCSV: string, previous?: Snapshot) {
  // Convert the CSV text into an array of values
  // Ex: for skills, each row is [rank, level, experience]
  const rows = await csv({ noheader: true, output: 'csv' }).fromString(rawCSV);

  // If a new skill/activity/boss was added to the hiscores,
  // prevent any further snapshot saves to prevent incorrect DB data
  if (rows.length !== SKILLS.length + ACTIVITIES.length + BOSSES.length + SKIPPED_ACTIVITY_INDICES.length) {
    throw new ServerError('The OSRS Hiscores were updated. Please wait for a fix.');
  }

  const snapshotFields: Partial<Snapshot> = {
    playerId,
    createdAt: new Date()
  };

  let totalExp = 0;

  // Populate the skills' values with the values from the csv
  SKILLS.forEach((s, i) => {
    const [rank, , experience] = rows[i];
    let expNum = parseInt(experience);

    if (s === Metric.OVERALL && expNum === 0) {
      // Sometimes the hiscores return 0 as unranked, but we want to be consistent and keep -1 as the "unranked" value
      expNum = -1;
    } else if (expNum === -1 && previous && previous[getMetricValueKey(s)] > -1) {
      // If the player was previously ranked in this skill, and then somehow became unranked, just fallback to the previous value
      expNum = previous[getMetricValueKey(s)];
    }

    snapshotFields[getMetricRankKey(s)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s)] = expNum;

    if (s !== Metric.OVERALL) totalExp += Math.max(0, expNum);
  });

  // If this player is unranked in overall exp, we should set their overall exp to the total exp of all skills
  // since that's at least closer to the real number than -1
  if (snapshotFields[getMetricValueKey(Metric.OVERALL)]! < totalExp && totalExp > 0) {
    snapshotFields[getMetricValueKey(Metric.OVERALL)] = totalExp;
  }

  // Populate the activities' values with the values from the csv
  for (let i = 0; i < ACTIVITIES.length + SKIPPED_ACTIVITY_INDICES.length; i++) {
    if (SKIPPED_ACTIVITY_INDICES.includes(i)) continue;

    const [rank, score] = rows[SKILLS.length + i];
    const skippedCount = SKIPPED_ACTIVITY_INDICES.filter(x => x < i).length;

    const activity = ACTIVITIES[i - skippedCount];

    snapshotFields[getMetricRankKey(activity)] = parseInt(rank);
    snapshotFields[getMetricValueKey(activity)] = parseInt(score);
  }

  // Populate the bosses' values with the values from the csv
  BOSSES.forEach((s, i) => {
    const [rank, kills] = rows[SKILLS.length + ACTIVITIES.length + SKIPPED_ACTIVITY_INDICES.length + i];

    snapshotFields[getMetricRankKey(s)] = parseInt(rank);
    snapshotFields[getMetricValueKey(s)] = parseInt(kills);
  });

  return snapshotFields as Snapshot;
}

async function parseCMLSnapshot(playerId: number, rawCSV: string) {
  // CML separates the data "blocks" by a space, for whatever reason.
  // These blocks are the datapoint timestamp, and the experience and rank arrays respectively.
  const rows = rawCSV.split(' ');
  const [timestamp, experienceCSV, ranksCSV] = rows;

  // Convert the experience and rank from CSV data into arrays
  const exps = (await csv({ noheader: true, output: 'csv' }).fromString(experienceCSV))[0];
  const ranks = (await csv({ noheader: true, output: 'csv' }).fromString(ranksCSV))[0];

  // If a new skill/activity/boss was added to the CML API,
  // prevent any further snapshot saves to prevent incorrect DB data
  if (exps.length !== SKILLS.length || ranks.length !== SKILLS.length) {
    throw new ServerError('The CML API was updated. Please wait for a fix.');
  }

  const snapshotFields: Partial<Snapshot> = {
    playerId,
    importedAt: new Date(),
    createdAt: new Date(parseInt(timestamp, 10) * 1000) // CML stores timestamps in seconds, we need milliseconds
  };

  // Populate the skills' values with experience and rank data
  SKILLS.forEach((s, i) => {
    snapshotFields[getMetricRankKey(s)] = parseInt(ranks[i]);
    snapshotFields[getMetricValueKey(s)] = parseInt(exps[i]);
  });

  return snapshotFields as Snapshot;
}

function formatSnapshot(snapshot: Snapshot, efficiencyMap: Map<Skill | Boss, number>): FormattedSnapshot {
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
            level: s === Metric.OVERALL ? getTotalLevel(snapshot) : getLevel(experience),
            ehp: efficiencyMap.get(s) || 0
          };

          return [s, value];
        })
      ) as MapOf<Skill, SkillValue>,
      bosses: Object.fromEntries(
        BOSSES.map(b => {
          const value: BossValue = {
            metric: b,
            kills: snapshot[getMetricValueKey(b)],
            rank: snapshot[getMetricRankKey(b)],
            ehb: efficiencyMap.get(b) || 0
          };

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
  parseHiscoresSnapshot,
  parseCMLSnapshot,
  formatSnapshot,
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
  getCombatLevelFromSnapshot
};
