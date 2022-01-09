import csv from 'csvtojson';
import { Op, QueryTypes } from 'sequelize';
import {
  parsePeriodExpression,
  ACTIVITIES,
  BOSSES,
  SKILLS,
  METRICS,
  isSkill,
  isBoss,
  getMetricRankKey,
  getMetricValueKey,
  getMetricMeasure,
  Metrics
} from '@wise-old-man/utils';
import { sequelize } from '../../../database';
import { Snapshot } from '../../../database/models';
import queries from '../../../database/queries';
import { BadRequestError, ServerError } from '../../errors';
import { formatDate } from '../../util/dates';
import * as efficiencyService from './efficiency.service';

/**
 * Converts a Snapshot instance into a JSON friendlier format
 */
function format(snapshot: Snapshot, efficiency?: any) {
  if (!snapshot) return null;

  const obj = {
    createdAt: snapshot.createdAt,
    importedAt: snapshot.importedAt
  };

  METRICS.forEach(m => {
    obj[m] = {
      rank: snapshot[getMetricRankKey(m)],
      [getMetricMeasure(m)]: snapshot[getMetricValueKey(m)]
    };

    if (m === Metrics.OVERALL) {
      obj[m].ehp = Math.max(0, snapshot.ehpValue);
    } else if (efficiency) {
      // Add individual ehp/ehb values
      if (isSkill(m)) {
        obj[m].ehp = efficiency[m];
      } else if (isBoss(m)) {
        obj[m].ehb = efficiency[m];
      }
    }
  });

  return obj;
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

  return !negativeGains && !excessiveGains;
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

  const ehpDiff = efficiencyService.calculateEHPDiff(before, after);
  const ehbDiff = efficiencyService.calculateEHBDiff(before, after);

  return ehpDiff + ehbDiff > hoursDiff;
}

/**
 * Checks whether there has been gains between two snapshots
 */
function hasChanged(before: Snapshot, after: Snapshot): boolean {
  if (!before) return true;
  if (!after) return false;

  // EHP and EHB can fluctuate without the player's envolvement
  const keysToIgnore = ['ehpValue', 'ehbValue'];

  const isValidKey = key => !keysToIgnore.includes(key);
  const keys = METRICS.map(m => getMetricValueKey(m));

  return keys.some(k => isValidKey(k) && after[k] > -1 && after[k] > before[k]);
}

/**
 * Checks whether two snapshots have negative gains in between.
 */
function hasNegativeGains(before: Snapshot, after: Snapshot): boolean {
  // Last man standing scores, ehp and ehb can fluctuate overtime
  const keysToIgnore = ['last_man_standingScore', 'ehpValue', 'ehbValue'];

  const isValidKey = key => !keysToIgnore.includes(key);
  const keys = METRICS.map(m => getMetricValueKey(m));

  return keys.some(k => isValidKey(k) && after[k] > -1 && after[k] < before[k]);
}

/**
 * Finds all snapshots within a time period, for a given player.
 */
async function getPlayerPeriodSnapshots(playerId: number, period: string) {
  const parsedPeriod = parsePeriodExpression(period);

  if (!parsedPeriod) throw new BadRequestError(`Invalid period: ${period}.`);

  const startDate = new Date(Date.now() - parsedPeriod.durationMs);
  const endDate = new Date();

  const snapshots = await getPlayerTimeRangeSnapshots(playerId, startDate, endDate);

  return snapshots;
}

async function getPlayerTimeRangeSnapshots(playerId: number, startDate: Date, endDate: Date) {
  const snapshots = await findAllBetween([playerId], startDate, endDate);
  return snapshots.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).map(format);
}

/**
 * Finds all snapshots for a given player.
 */
async function findAll(playerId: number, limit: number): Promise<Snapshot[]> {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  const result = await Snapshot.findAll({
    where: { playerId },
    order: [['createdAt', 'DESC']],
    limit
  });

  return result;
}

/**
 * Finds the latest snapshot for a given player.
 */
async function findLatest(playerId: number, maxDate = new Date()): Promise<Snapshot | null> {
  const result = await Snapshot.findOne({
    where: { playerId, createdAt: { [Op.lte]: maxDate } },
    order: [['createdAt', 'DESC']]
  });

  return result;
}

/**
 * Finds all snapshots between the two given dates,
 * for any of the given player ids.
 * Useful for tracking the evolution of every player in a competition.
 */
async function findAllBetween(playerIds: number[], startDate: Date, endDate: Date): Promise<Snapshot[]> {
  const results = await Snapshot.findAll({
    where: {
      playerId: playerIds,
      createdAt: { [Op.and]: [{ [Op.gte]: startDate }, { [Op.lte]: endDate }] }
    },
    order: [['createdAt', 'ASC']]
  });
  return results;
}

/**
 * Finds the first snapshot since "date" for a given player.
 */
async function findFirstSince(playerId: number, date: Date): Promise<Snapshot | null> {
  const result = await Snapshot.findOne({
    where: { playerId, createdAt: { [Op.gte]: date } },
    order: [['createdAt', 'ASC']]
  });

  return result;
}

function average(snapshots: Snapshot[]): Snapshot {
  if (!snapshots && snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find average.');
  }

  const base = Snapshot.build({
    ...snapshots[0],
    id: -1,
    playerId: -1,
    createdAt: null,
    importedAt: null
  });

  METRICS.forEach(metric => {
    const valueKey = getMetricValueKey(metric);
    const rankKey = getMetricRankKey(metric);

    const valueSum = snapshots
      .map((s: Snapshot) => s[valueKey])
      .reduce((acc: number, cur: any) => acc + parseInt(cur), 0);

    const rankSum = snapshots
      .map((s: Snapshot) => s[rankKey])
      .reduce((acc: number, cur: any) => acc + parseInt(cur), 0);

    const valueAvg = Math.round(valueSum / snapshots.length);
    const rankAvg = Math.round(rankSum / snapshots.length);

    base[valueKey] = valueAvg;
    base[rankKey] = rankAvg;
  });

  return base;
}

/**
 * Saves all supplied snapshots, ignoring any duplicates by playerId and createdAt.
 * Note: This only works if all the supplied snaphots are from a single player.
 */
async function saveAll(snapshotFragments): Promise<Snapshot[]> {
  if (snapshotFragments.length === 0) return [];

  const existingSnapshots = await Snapshot.findAll({
    where: { playerId: snapshotFragments[0].playerId }
  });

  const existingVals = existingSnapshots.map(({ playerId, createdAt }) => {
    return JSON.stringify({ playerId, timestamp: createdAt.getTime() });
  });

  // Filter out any repeated snapshots
  const newVals = snapshotFragments.filter(({ playerId, createdAt }) => {
    return !existingVals.includes(JSON.stringify({ playerId, timestamp: createdAt.getTime() }));
  });

  if (!newVals || !newVals.length) {
    return [];
  }

  const results = await Snapshot.bulkCreate(newVals);
  return results;
}

/**
 * Converts a CSV row imported from the CML API into a Snapshot object.
 */
async function fromCML(playerId: number, historyRow: string) {
  // CML separates the data "blocks" by a space, for whatever reason.
  // These blocks are the datapoint timestamp, and the experience and rank arrays respectively.
  const rows = historyRow.split(' ');
  const [timestamp, experienceCSV, ranksCSV] = rows;

  // CML stores timestamps in seconds, we need milliseconds
  const createdAt = new Date(parseInt(timestamp, 10) * 1000);
  const importedAt = new Date();

  // Convert the experience and rank from CSV data into arrays
  const exps = (await csv({ noheader: true, output: 'csv' }).fromString(experienceCSV))[0];
  const ranks = (await csv({ noheader: true, output: 'csv' }).fromString(ranksCSV))[0];

  // If a new skill/activity/boss was added to the CML API,
  // prevent any further snapshot saves to prevent incorrect DB data
  if (exps.length !== SKILLS.length) {
    throw new ServerError('The CML API was updated. Please wait for a fix.');
  }

  const stats = {};

  // Populate the skills' values with experience and rank data
  SKILLS.forEach((s, i) => {
    stats[getMetricRankKey(s)] = parseInt(ranks[i]);
    stats[getMetricValueKey(s)] = parseInt(exps[i]);
  });

  return { playerId, createdAt, importedAt, ...stats };
}

/**
 * Converts CSV data imported from the OSRS Hiscores API into Snapshot instance.
 */
async function fromRS(playerId: number, csvData: string): Promise<Snapshot> {
  // Convert the CSV text into an array of values
  // Ex: for skills, each row is [rank, level, experience]
  const rows = await csv({ noheader: true, output: 'csv' }).fromString(csvData);

  // If a new skill/activity/boss was added to the hiscores,
  // prevent any further snapshot saves to prevent incorrect DB data
  if (rows.length !== SKILLS.length + ACTIVITIES.length + BOSSES.length) {
    throw new ServerError('The OSRS Hiscores were updated. Please wait for a fix.');
  }

  const stats = {};

  // Populate the skills' values with the values from the csv
  SKILLS.forEach((s, i) => {
    const [rank, , experience] = rows[i];
    const expNum = parseInt(experience);

    stats[getMetricRankKey(s)] = parseInt(rank);
    stats[getMetricValueKey(s)] = s === Metrics.OVERALL && expNum === 0 ? -1 : expNum;
  });

  // Populate the activities' values with the values from the csv
  ACTIVITIES.forEach((s, i) => {
    const [rank, score] = rows[SKILLS.length + i];
    stats[getMetricRankKey(s)] = parseInt(rank);
    stats[getMetricValueKey(s)] = parseInt(score);
  });

  // Populate the bosses' values with the values from the csv
  BOSSES.forEach((s, i) => {
    const [rank, kills] = rows[SKILLS.length + ACTIVITIES.length + i];
    stats[getMetricRankKey(s)] = parseInt(rank);
    stats[getMetricValueKey(s)] = parseInt(kills);
  });

  return Snapshot.build({ playerId, ...stats });
}

async function getGroupLastSnapshots(playerIds: number[], endDate: Date, attributeSelector = '*') {
  const latestSnapshots: Snapshot[] = await sequelize.query(
    queries.FETCH_LAST_SNAPSHOTS_IN_PERIOD_PLAYER_IDS(
      attributeSelector,
      playerIds.join(','),
      formatDate(endDate, 'YYYY-MM-DD HH:mm:ss')
    ),
    { type: QueryTypes.SELECT }
  );

  return latestSnapshots;
}

async function getGroupFirstSnapshots(playerIds: number[], startDate: Date, attributeSelector = '*') {
  const firstSnapshots: Snapshot[] = await sequelize.query(
    queries.FETCH_FIRST_SNAPSHOTS_IN_PERIOD_PLAYER_IDS(
      attributeSelector,
      playerIds.join(','),
      formatDate(startDate, 'YYYY-MM-DD HH:mm:ss')
    ),
    { type: QueryTypes.SELECT }
  );

  return firstSnapshots;
}

export {
  format,
  withinRange,
  hasChanged,
  hasExcessiveGains,
  hasNegativeGains,
  findAll,
  findLatest,
  findAllBetween,
  findFirstSince,
  average,
  saveAll,
  fromCML,
  fromRS,
  getGroupLastSnapshots,
  getGroupFirstSnapshots,
  getPlayerPeriodSnapshots,
  getPlayerTimeRangeSnapshots
};
