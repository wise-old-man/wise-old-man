import { forEach, keyBy, omit } from 'lodash';
import { Player, Record } from '../../../database/models';
import { ALL_METRICS, PERIODS, PLAYER_BUILDS, PLAYER_TYPES } from '../../constants';
import { BadRequestError } from '../../errors';
import { getMeasure } from '../../util/metrics';
import { getPlayerPeriodDeltas } from './delta.service';

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

  const periodRecords = await Record.findAll({ where: { playerId, period } });
  const periodDelta = await getPlayerPeriodDeltas(playerId, period);

  const recordMap: any = keyBy(
    periodRecords.map(r => r.toJSON()),
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
      await record.update({ value: r.value });
    })
  );

  // Create all missing records
  await Record.bulkCreate(toCreate, { ignoreDuplicates: true });
}

/**
 * Finds all records for a given player id.
 * These records can be optionally filtered by period and metric.
 */
async function getPlayerRecords(playerId: number, period?: string, metric?: string) {
  if (period && !PERIODS.includes(period)) {
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

  const records = await Record.findAll({ where: query });

  return records.map(r => format(r));
}

/**
 * Gets the best records for a specific metric and period.
 * Optionally, the records can be filtered by the playerType and playerBuild.
 */
async function getLeaderboard(metric: string, period: string, type: string, build: string) {
  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  if (type && !PLAYER_TYPES.includes(type)) {
    throw new BadRequestError(`Invalid player type: ${type}.`);
  }

  if (build && !PLAYER_BUILDS.includes(build)) {
    throw new BadRequestError(`Invalid player build: ${build}.`);
  }

  const query: any = {};
  if (type) query.type = type;
  if (build) query.build = build;

  const records = await Record.findAll({
    where: { period, metric },
    order: [['value', 'DESC']],
    include: [{ model: Player, where: query }],
    limit: 20
  });

  return records;
}

/**
 * Gets the best records for a specific metric, period and list of players.
 */
async function getGroupLeaderboard(metric, period, playerIds, pagination) {
  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  const records = await Record.findAll({
    where: { playerId: playerIds, period, metric },
    include: [{ model: Player }],
    order: [['value', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  const formattedRecords = records.map(({ player, value, updatedAt }) => ({
    playerId: player.id,
    username: player.username,
    displayName: player.displayName,
    type: player.type,
    flagged: player.flagged,
    value,
    updatedAt
  }));

  return formattedRecords;
}

export { syncRecords, getPlayerRecords, getLeaderboard, getGroupLeaderboard };
