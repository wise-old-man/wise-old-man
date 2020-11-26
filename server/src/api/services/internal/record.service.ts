import { forEach } from 'lodash';
import { Op } from 'sequelize';
import { Player, Record } from '../../../database/models';
import { Pagination } from '../../../types';
import { ALL_METRICS, PERIODS, PLAYER_BUILDS, PLAYER_TYPES } from '../../constants';
import { BadRequestError } from '../../errors';
import { getMeasure } from '../../util/metrics';
import { buildQuery } from '../../util/query';
import { getPlayerPeriodDeltas } from './delta.service';

interface PlayerRecordsFilter {
  period?: string;
  metric?: string;
}

interface GroupRecordsFilter extends PlayerRecordsFilter {
  playerIds: number[];
}

interface GlobalRecordsFilter extends PlayerRecordsFilter {
  playerType?: string;
  playerBuild?: string;
}

/**
 * Syncs all the player records, for a given period of time.
 *
 * This will compare the current delta values, and if more than
 * the previous record, it will replace the record's value.
 *
 * Note: this method will only created records for values > 0
 */
async function syncRecords(playerId: number, period: string): Promise<void> {
  const periodRecords = await Record.findAll({ where: { playerId, period } });
  const periodDeltas = await getPlayerPeriodDeltas(playerId, period);

  const recordMap: { [metric: string]: Record } = Object.fromEntries(
    periodRecords.map(r => [r.metric, r])
  );

  const toCreate = [];
  const toUpdate = [];

  forEach(periodDeltas.data, (values, metric) => {
    const { gained } = values[getMeasure(metric)];

    if (gained <= 0) return;

    if (!recordMap[metric]) {
      toCreate.push({ playerId, period, metric, value: gained });
    } else if (gained > recordMap[metric].value) {
      toUpdate.push({ playerId, period, metric, value: gained });
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
async function getPlayerRecords(playerId: number, filter: PlayerRecordsFilter): Promise<Record[]> {
  const { period, metric } = filter;

  if (period && !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (metric && !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  const records = await Record.findAll({
    where: buildQuery({ playerId, period, metric })
  });

  return records;
}

/**
 * Gets the best records for a specific metric and period.
 * Optionally, the records can be filtered by the playerType and playerBuild.
 */
async function getLeaderboard(filter: GlobalRecordsFilter, pagination: Pagination): Promise<Record[]> {
  const { metric, period, playerBuild, playerType } = filter;

  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  if (playerType && !PLAYER_TYPES.includes(playerType)) {
    throw new BadRequestError(`Invalid player type: ${playerType}.`);
  }

  if (playerBuild && !PLAYER_BUILDS.includes(playerBuild)) {
    throw new BadRequestError(`Invalid player build: ${playerBuild}.`);
  }

  const query = buildQuery({ type: playerType, build: playerBuild });

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (query.type && query.type === 'ironman') {
    query.type = { [Op.or]: ['ironman', 'hardcore', 'ultimate'] };
  }

  const records = await Record.findAll({
    where: { period, metric },
    include: [
      {
        model: Player,
        where: query
      }
    ],
    order: [['value', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  return records;
}

/**
 * Gets the best records for a specific metric, period and list of players.
 */
async function getGroupLeaderboard(
  filter: GroupRecordsFilter,
  pagination: Pagination
): Promise<Record[]> {
  const { playerIds, period, metric } = filter;

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

  return records;
}

export { syncRecords, getPlayerRecords, getLeaderboard, getGroupLeaderboard };
