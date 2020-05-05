const csv = require('csvtojson');
const _ = require('lodash');
const moment = require('moment');
const { Op } = require('sequelize');
const {
  ALL_METRICS,
  SKILLS,
  BOSSES,
  ACTIVITIES,
  getRankKey,
  getValueKey,
  getMeasure
} = require('../../constants/metrics');
const PERIODS = require('../../constants/periods');
const { Snapshot } = require('../../../database');
const { ServerError, BadRequestError } = require('../../errors');

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
async function findAllGrouped(playerId) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  const partials = await Promise.all(
    PERIODS.map(async period => {
      const list = await findAllInPeriod(playerId, period);
      return { period, snapshots: list };
    })
  );

  // Turn an array of snapshots, into an object, using the period as a key,
  // then include only the snapshots array in the final object, not the period fields
  return _.mapValues(_.keyBy(partials, 'period'), p => p.snapshots);
}

/**
 * Finds all snapshots within a time period, for a given player.
 */
async function findAllInPeriod(playerId, period) {
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
 * Finds the first snapshot in the given time period for a given player.
 * Useful for finding the start snapshot of a delta.
 */
async function findFirstIn(playerId, period) {
  if (!PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period ${period}.`);
  }

  const before = moment().subtract(1, period);

  const result = await Snapshot.findOne({
    where: { playerId, createdAt: { [Op.gte]: before.toDate() } },
    order: [['createdAt', 'ASC']]
  });
  return result;
}

/**
 * Finds the first snapshot since the given date for a given player.
 * Useful for finding the start snapshot for any competition participation.
 */
async function findFirstSince(playerId, date) {
  const result = await Snapshot.findOne({
    where: { playerId, createdAt: { [Op.gte]: date } },
    order: [['createdAt', 'ASC']]
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
 * Calculates the difference in ranks and values (for every metric), between two snapshots
 */
function diff(start, end) {
  const obj = {};

  ALL_METRICS.forEach(s => {
    const rankKey = getRankKey(s);
    const valueKey = getValueKey(s);

    obj[rankKey] = end[rankKey] - start[rankKey];
    obj[valueKey] = end[valueKey] - start[valueKey];
  });

  return obj;
}

/**
 * Saves all supplied snapshots, ignoring any
 * duplicates by playerId and createdAt.
 *
 * Note: This only works if all the supplied snaphots
 * are from a single player.
 */
async function saveAll(snapshots) {
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
 * Converts a CSV row imported from the CML
 * API into a Snapshot object.
 *
 * @param {number} username The player's id.
 * @param {string} csvData The CSV row to be converted.
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
 * Converts CSV data imported from the OSRS Hiscores
 * API into Snapshot instance.
 *
 * @param {number} playerId The player's id.
 * @param {string} csvData The CSV data to be converted.
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

  const newSnapshot = await Snapshot.create({ playerId, ...stats });
  return newSnapshot;
}

exports.format = format;
exports.findAll = findAll;
exports.findAllGrouped = findAllGrouped;
exports.findAllInPeriod = findAllInPeriod;
exports.findFirstIn = findFirstIn;
exports.findFirstSince = findFirstSince;
exports.findLatest = findLatest;
exports.findAllBetween = findAllBetween;
exports.diff = diff;
exports.saveAll = saveAll;
exports.fromCML = fromCML;
exports.fromRS = fromRS;
