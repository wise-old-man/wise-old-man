const _ = require('lodash');
const PERIODS = require('../../constants/periods');
const { ALL_METRICS, getMeasure } = require('../../constants/metrics');
const { BadRequestError } = require('../../errors');
const { Player, Record } = require('../../../database');
const deltaService = require('../deltas/delta.service');

function format(record) {
  return _.omit(record.toJSON(), ['id', 'playerId']);
}

/**
 * Syncs all the player records, for a given period of time.
 *
 * This will compare the current delta values, and if more than
 * the previous record, it will replace the record's value.
 */
async function syncRecords(playerId, period) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player.`);
  }

  const allRecordDefs = ALL_METRICS.map(metric => ({ period, metric }));
  const periodDelta = await deltaService.getDelta(playerId, period);
  let playerRecords = await Record.findAll({ where: { playerId, period } });

  // If has missing records, create them
  if (playerRecords.length !== allRecordDefs.length) {
    // Create a map of all metrics (ex: {"woodcutting": false, "zulrah": false})
    const checkMap = _.mapValues(_.keyBy(allRecordDefs, 'metric'), () => false);

    // Mark any found playerRecords as existant (true)
    playerRecords.forEach(r => {
      checkMap[r.metric] = true;
    });

    // Gather the record definitions for any missing records
    const missingRecordDefs = Object.keys(checkMap)
      .map(k => ({ key: k, value: checkMap[k] }))
      .filter(m => !m.value)
      .map(m => ({ playerId, period, metric: m.key, value: 0 }));

    // Add all missing records
    const newRecords = await Record.bulkCreate(missingRecordDefs, { ignoreDuplicates: true });

    // Add newly created records to the playerRecords array, to be processed later on
    if (newRecords && newRecords.length > 0) {
      playerRecords = [...playerRecords, ...newRecords];
    }
  }

  await Promise.all(
    playerRecords.map(async record => {
      const { value, metric } = record;
      const newValue = periodDelta.data[metric][getMeasure(metric)].delta;

      // If the current delta is higher than the previous record,
      // update the previous record's value
      if (value < newValue) {
        await record.update({ value: newValue });
      }

      return record;
    })
  );
}

/**
 * Finds all records for a given player id.
 * These records can be optionally filtered by period and metric.
 */
async function findAll(playerId, period, metric) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  if (period && !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (metric && !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  const query = {
    playerId
  };

  if (period) {
    query.period = period;
  }

  if (metric) {
    query.metric = metric;
  }

  const records = await Record.findAll({ where: query });

  return records.map(r => format(r));
}

/**
 * Gets the all the best records for a specific metric.
 * Optionally, the records can be filtered by the playerType.
 */
async function getLeaderboard(metric, playerType) {
  const partials = await Promise.all(
    PERIODS.map(async period => {
      const list = await getPeriodLeaderboard(metric, period, playerType);
      return { period, records: list };
    })
  );

  // Turn an array of records, into an object, using the period as a key,
  // then include only the records array in the final object, not the period fields
  return _.mapValues(_.keyBy(partials, 'period'), p => p.records);
}

/**
 * Gets the best records for a specific metric and period.
 * Optionally, the records can be filtered by the playerType.
 */
async function getPeriodLeaderboard(metric, period, playerType) {
  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  const records = await Record.findAll({
    where: { period, metric },
    order: [['value', 'DESC']],
    limit: 20,
    include: [{ model: Player, where: playerType && { type: playerType } }]
  });

  const formattedRecords = records.map(({ player, value, updatedAt }) => ({
    playerId: player.id,
    username: player.username,
    type: player.type,
    value,
    updatedAt
  }));

  return formattedRecords;
}

exports.syncRecords = syncRecords;
exports.findAll = findAll;
exports.getPeriodLeaderboard = getPeriodLeaderboard;
exports.getLeaderboard = getLeaderboard;
