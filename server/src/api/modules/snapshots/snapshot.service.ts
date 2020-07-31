import csv from 'csvtojson';
import { keyBy, mapValues } from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';
import { Snapshot } from '../../../database';
import { ACTIVITIES, ALL_METRICS, BOSSES, PERIODS, SKILLS } from '../../constants';
import { BadRequestError, ServerError } from '../../errors';
import { getMeasure, getRankKey, getValueKey } from '../../util/metrics';
import * as efficiencyService from '../efficiency/efficiency.service';

/**
 * Converts a Snapshot instance into a JSON friendlier format
 */
function format(snapshot) {
  if (!snapshot) {
    return null;
  }

  const obj = {
    createdAt: snapshot.createdAt,
    importedAt: snapshot.importedAt
  };

  ALL_METRICS.forEach(s => {
    obj[s] = {
      rank: snapshot[getRankKey(s)],
      [getMeasure(s)]: snapshot[getValueKey(s)]
    };
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

  const hoursDiff = Math.max(24, timeDiff / 1000 / 3600);

  const ehpDiff = efficiencyService.calculateEHPDiff(before, after);
  const ehbDiff = efficiencyService.calculateEHBDiff(before, after);

  return ehpDiff + ehbDiff > hoursDiff;
}

/**
 * Checks whether two snapshots have negative gains in between.
 */
function hasNegativeGains(before: Snapshot, after: Snapshot): boolean {
  // Last man standing scores can fluctuate overtime
  const isValidKey = key => key !== 'last_man_standingScore';
  const keys = ALL_METRICS.map(m => getValueKey(m));

  return keys.some(k => isValidKey(k) && after[k] > -1 && after[k] < before[k]);
}

/**
 * Finds all snapshots for a given player.
 */
async function findAll(playerId, limit) {
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
 * Finds all player snapshots, grouped by period.
 *
 * Ex:
 * {
 *    day: [...],
 *    week: [...],
 *    etc
 * }
 */
async function getAllGrouped(playerId) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  const partials = await Promise.all(
    PERIODS.map(async period => {
      const list = await getAllInPeriod(playerId, period);
      return { period, snapshots: list };
    })
  );

  // Turn an array of snapshots, into an object, using the period as a key,
  // then include only the snapshots array in the final object, not the period fields
  return mapValues(keyBy(partials, 'period'), p => p.snapshots);
}

/**
 * Finds all snapshots within a time period, for a given player.
 */
async function getAllInPeriod(playerId, period) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  if (!PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  const before = moment().subtract(1, period);

  const result = await Snapshot.findAll({
    where: {
      playerId,
      createdAt: { [Op.gte]: before.toDate() }
    },
    order: [['createdAt', 'DESC']]
  });

  return result.map(r => format(r));
}

/**
 * Finds the latest snapshot for a given player.
 */
async function findLatest(playerId) {
  const result = await Snapshot.findOne({
    where: { playerId },
    order: [['createdAt', 'DESC']]
  });
  return result;
}

/**
 * Finds all snapshots between the two given dates,
 * for any of the given player ids.
 * Useful for tracking the evolution of every player in a competition.
 */
async function findAllBetween(playerIds, startDate, endDate) {
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
async function findFirstSince(playerId, date) {
  const result = await Snapshot.findOne({
    where: { playerId, createdAt: { [Op.gte]: date } },
    order: [['createdAt', 'ASC']]
  });

  return result;
}

function average(snapshots) {
  if (!snapshots && snapshots.length === 0) {
    throw new ServerError('Invalid snapshots list. Failed to find average.');
  }

  const accumulator = {};
  const invalidKeys = ['id', 'createdAt', 'importedAt', 'playerId'];
  const keys = Object.keys(snapshots[0]).filter(k => !invalidKeys.includes(k));

  keys.forEach(key => {
    const sum = snapshots.map(s => s[key]).reduce((acc, cur) => acc + parseInt(cur, 10), 0);
    const avg = Math.round(sum / snapshots.length);
    accumulator[key] = avg;
  });

  return accumulator;
}

/**
 * Saves all supplied snapshots, ignoring any
 * duplicates by playerId and createdAt.
 *
 * Note: This only works if all the supplied snaphots
 * are from a single player.
 */
async function saveAll(snapshots) {
  if (snapshots.length === 0) {
    return [];
  }

  const { playerId } = snapshots[0];

  const existingSnapshots = await Snapshot.findAll({ where: { playerId } });

  const existingVals = existingSnapshots.map(s =>
    JSON.stringify({
      playerId: s.playerId,
      timestamp: s.createdAt.getTime()
    })
  );

  const newVals = snapshots.filter(
    s =>
      !existingVals.includes(
        JSON.stringify({
          playerId: s.playerId,
          timestamp: s.createdAt.getTime()
        })
      )
  );

  if (!newVals || !newVals.length) {
    return [];
  }

  const results = await Snapshot.bulkCreate(newVals);
  return results;
}

/**
 * Converts a CSV row imported from the CML API into a Snapshot object.
 */
async function fromCML(playerId, historyRow) {
  // CML separates the data "blocks" by a space,
  // for whatever reason. These blocks are the
  // datapoint timestamp, and the experience and rank
  // arrays respectively.
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
    stats[getRankKey(s)] = parseInt(ranks[i], 10);
    stats[getValueKey(s)] = parseInt(exps[i], 10);
  });

  return { playerId, createdAt, importedAt, ...stats };
}

/**
 * Converts CSV data imported from the OSRS Hiscores API into Snapshot instance.
 */
async function fromRS(playerId, csvData) {
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
    stats[getRankKey(s)] = parseInt(rank, 10);
    stats[getValueKey(s)] = parseInt(experience, 10);
  });

  // Populate the activities' values with the values from the csv
  ACTIVITIES.forEach((s, i) => {
    const [rank, score] = rows[SKILLS.length + i];
    stats[getRankKey(s)] = parseInt(rank, 10);
    stats[getValueKey(s)] = parseInt(score, 10);
  });

  // Populate the bosses' values with the values from the csv
  BOSSES.forEach((s, i) => {
    const [rank, kills] = rows[SKILLS.length + ACTIVITIES.length + i];
    stats[getRankKey(s)] = parseInt(rank, 10);
    stats[getValueKey(s)] = parseInt(kills, 10);
  });

  const newSnapshot = await Snapshot.build({ playerId, ...stats });
  return newSnapshot;
}

export {
  format,
  withinRange,
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
  getAllGrouped,
  getAllInPeriod
};
