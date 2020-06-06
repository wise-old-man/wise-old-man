import * as csv from 'csvtojson';
import { mapValues, keyBy } from 'lodash';
import * as moment from 'moment';
import { Op } from 'sequelize';
import {
  ALL_METRICS,
  SKILLS,
  BOSSES,
  ACTIVITIES,
  getRankKey,
  getValueKey,
  getMeasure,
  isSkill
} from '../../constants/metrics';
import { periods } from '../../constants/periods';
import { ServerError, BadRequestError } from '../../errors';
import { Snapshot } from '../../../database/models'
import { getRepository, MoreThanOrEqual, LessThanOrEqual, In, Raw } from 'typeorm';

const snapshotRepository = getRepository(Snapshot);

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

  const snapshot = await snapshotRepository.find({
    where: { playerId },
    order: {
      createdAt: 'DESC'
    },
    take: limit
  })

  // const result = await Snapshot.findAll({
  //   where: { playerId },
  //   order: [['createdAt', 'DESC']],
  //   limit
  // });

  return snapshot;
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
    periods.map(async period => {
      const list = await findAllInPeriod(playerId, period);
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
async function findAllInPeriod(playerId, period) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  if (!periods.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  const before = moment().subtract(1, period);

  const snapshot = await snapshotRepository.find({
    where: {
      playerId,
      createdAt: MoreThanOrEqual(before.toDate())
    },
    order: {
      createdAt: 'DESC'
    }
  })

  // const result = await Snapshot.findAll({
  //   where: {
  //     playerId,
  //     createdAt: { [Op.gte]: before.toDate() }
  //   },
  //   order: [['createdAt', 'DESC']]
  // });

  return snapshot.map(r => format(r));
}

/**
 * Finds the latest snapshot for a given player.
 */
async function findLatest(playerId) {
  const snapshot = await snapshotRepository.findOne({
    where: {
      playerId
    },
    order: {
      createdAt: 'DESC'
    }
  })

  // const result = await Snapshot.findOne({
  //   where: { playerId },
  //   order: [['createdAt', 'DESC']]
  // });
  return snapshot;
}

/**
 * Finds the first snapshot in the given time period for a given player.
 */
async function findFirstIn(playerId, period) {
  if (!periods.includes(period)) {
    throw new BadRequestError(`Invalid period ${period}.`);
  }

  const before = moment().subtract(1, period);

  const snapshot = await snapshotRepository.findOne({
    where: {
      playerId,
      createdAt: MoreThanOrEqual(before.toDate())
    },
    order: {
      createdAt: 'ASC'
    }
  })

  // const result = await Snapshot.findOne({
  //   where: { playerId, createdAt: { [Op.gte]: before.toDate() } },
  //   order: [['createdAt', 'ASC']]
  // });
  return snapshot;
}

/**
 * Finds the first snapshot since the given date for a given player.
 */
async function findFirstSince(playerId, date) {
  const result = await snapshotRepository.findOne({
    where: {
      playerId,
      createdAt: MoreThanOrEqual(date)
    },
    order: {
      createdAt: 'ASC'
    }
  })
  // const result = await Snapshot.findOne({
  //   where: { playerId, createdAt: { [Op.gte]: date } },
  //   order: [['createdAt', 'ASC']]
  // });
  return result;
}

/**
 * Finds all snapshots between the two given dates,
 * for any of the given player ids.
 * Useful for tracking the evolution of every player in a competition.
 */
async function findAllBetween(playerIds, startDate, endDate) {
  const snapshot = await snapshotRepository.find({
    where: {
      playerId: In(playerIds),
      createdAt: Raw(alias => `${alias} >= ${startDate} AND ${alias} <= ${endDate}`)
    },
    order: {
      createdAt: 'ASC'
    }
  })
  // const results = await Snapshot.findAll({
  //   where: {
  //     playerId: playerIds,
  //     createdAt: { [Op.and]: [{ [Op.gte]: startDate }, { [Op.lte]: endDate }] }
  //   },
  //   order: [['createdAt', 'ASC']]
  // });
  return snapshot;
}

/**
 * Calculates the difference in ranks and values (for every metric), between two snapshots
 */
function diff(start, end, initialValues) {
  const obj = {};

  ALL_METRICS.forEach(s => {
    const rankKey = getRankKey(s);
    const valueKey = getValueKey(s);

    const initialRank = initialValues ? initialValues[rankKey] : -1;
    const initialValue = initialValues ? initialValues[valueKey] : -1;

    const endValue = end[valueKey];
    const endRank = end[rankKey];

    const startValue = start[valueKey] === -1 ? initialValue : start[valueKey];
    const startRank = start[rankKey] === -1 && !isSkill(s) ? initialRank : start[rankKey];

    // Do not use initial ranks for skill, to prevent -1 ranks
    // introduced by https://github.com/psikoi/wise-old-man/pull/93 from creating crazy diffs
    obj[rankKey] = isSkill(s) && start[rankKey] === -1 ? 0 : endRank - startRank;
    obj[valueKey] = endValue - startValue;
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

  const existingSnapshots = await snapshotRepository.find({ playerId });

  // const existingSnapshots = await Snapshot.findAll({ where: { playerId } });

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

  const snapshot = await snapshotRepository.save(newVals)

  // const results = await Snapshot.bulkCreate(newVals);
  return snapshot;
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

  const newSnapshot = await snapshotRepository.create({ playerId, ...stats });

  // const newSnapshot = await Snapshot.create({ playerId, ...stats });
  return newSnapshot;
}

export {
  format,
  findAll,
  findAllGrouped,
  findAllInPeriod,
  findFirstIn,
  findFirstSince,
  findLatest,
  findAllBetween,
  diff,
  saveAll,
  fromCML,
  fromRS
};