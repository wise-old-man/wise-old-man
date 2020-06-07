import { omit, keyBy, forEach, mapValues } from 'lodash';
import { periods } from '../../constants/periods';
import { ALL_METRICS, getMeasure } from '../../constants/metrics';
import { BadRequestError } from '../../errors';
import { Player, Record } from '../../../database/models';
import * as deltaService from '../deltas/delta.service';
import { getRepository } from 'typeorm';

const playerRepository = getRepository(Player);
const recordRepository = getRepository(Record);

function format(record) {
  return omit(record.toJSON(), ['id', 'playerId']);
}

/**
 * Syncs all the player records, for a given period of time.
 *
 * This will compare the current delta values, and if more than
 * the previous record, it will replace the record's value.
 *
 * Note: this method will only created records for values > 0
 */
async function syncRecords(playerId, period) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player.`);
  }

  const periodRecords = await recordRepository.find({
    where: { playerId, period }
  })

  // const periodRecords = await Record.findAll({ where: { playerId, period } });
  const periodDelta = await deltaService.getDelta(playerId, period);

  const recordMap = keyBy(
    periodRecords.map((r: any) => r.toJSON()),
    'metric'
  );

  const toCreate = [];
  const toUpdate = [];

  forEach(periodDelta.data, (values, metric) => {
    const { gained } = values[getMeasure(metric)];

    if (gained > 0) {
      if (!recordMap[metric]) {
        toCreate.push({ playerId, period, metric, value: gained });
      } else if (gained > recordMap[metric].value) {
        toUpdate.push({ playerId, period, metric, value: gained });
      }
    }
  });

  // Update all "outdated records"
  await Promise.all(
    toUpdate.map(async r => {
      const record = periodRecords.find(p => p.metric === r.metric);
      await recordRepository.save({ value: r.value });
    })
  );

  // Create all missing records
  await recordRepository.create(toCreate);
}

/**
 * Finds all records for a given player id.
 * These records can be optionally filtered by period and metric.
 */
async function findAll(playerId, period, metric) {
  if (!playerId) {
    throw new BadRequestError(`Invalid player id.`);
  }

  if (period && !periods.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (metric && !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  const query: any = {
    playerId
  };

  if (period) {
    query.period = period;
  }

  if (metric) {
    query.metric = metric;
  }

  // const records = await Record.findAll({ where: query });

  const records = await recordRepository.find({
    where: query
  })

  return records.map(r => format(r));
}

/**
 * Gets the all the best records for a specific metric.
 * Optionally, the records can be filtered by the playerType.
 */
async function getLeaderboard(metric, playerType) {
  const partials = await Promise.all(
    periods.map(async period => {
      const list = await getPeriodLeaderboard(metric, period, playerType);
      return { period, records: list };
    })
  );

  // Turn an array of records, into an object, using the period as a key,
  // then include only the records array in the final object, not the period fields
  return mapValues(keyBy(partials, 'period'), p => p.records);
}

/**
 * Gets the best records for a specific metric and period.
 * Optionally, the records can be filtered by the playerType.
 */
async function getPeriodLeaderboard(metric, period, playerType) {
  if (!period || !periods.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  const records: any = await recordRepository.find({
    where: { period, metric },
    order: {
      value: 'DESC'
    },
    take: 20,
    join: {
      alias: 'player',
      leftJoin: {
        type: playerType
      }
    }
  })

  // const records = await Record.findAll({
  //   where: { period, metric },
  //   order: [['value', 'DESC']],
  //   limit: 20,
  //   include: [{ model: Player, where: playerType && { type: playerType } }]
  // });

  const formattedRecords = records.map(({ player, value, updatedAt }) => ({
    playerId: player.id,
    username: player.username,
    displayName: player.displayName,
    type: player.type,
    value,
    updatedAt
  }));

  return formattedRecords;
}

export {
  syncRecords,
  findAll,
  getPeriodLeaderboard,
  getLeaderboard
}