import { Op } from 'sequelize';
import {
  PlayerType,
  PlayerBuild,
  PLAYER_TYPES,
  PLAYER_BUILDS,
  isValidPeriod
} from '@wise-old-man/utils';
import { Delta, Player, Record } from '../../../database/models';
import { Pagination } from '../../../types';
import { ALL_METRICS } from '../../constants';
import { BadRequestError } from '../../errors';
import { buildQuery } from '../../util/query';
import * as geoService from '../external/geo.service';

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
  country?: string;
}

/**
 * Syncs all the player records, for a given period of time.
 *
 * This will compare the current delta values, and if more than
 * the previous record, it will replace the record's value.
 *
 * Note: this method will only created records for values > 0
 */
async function syncRecords(delta: Delta): Promise<void> {
  const { playerId, period } = delta;

  const records = await Record.findAll({ where: { playerId, period } });
  const recordMap: { [metric: string]: Record } = Object.fromEntries(records.map(r => [r.metric, r]));

  const toCreate = [];
  const toUpdate = [];

  ALL_METRICS.forEach(metric => {
    if (delta[metric] <= 0) return;

    if (!recordMap[metric]) {
      toCreate.push({ playerId, period, metric, value: delta[metric] });
    } else if (delta[metric] > recordMap[metric].value) {
      toUpdate.push({ playerId, period, metric, value: delta[metric] });
    }
  });

  if (toUpdate.length > 0) {
    // Update all "outdated records"
    await Promise.all(
      toUpdate.map(async r => {
        const record = records.find(p => p.metric === r.metric);
        await record.update({ value: r.value });
      })
    );
  }

  if (toCreate.length > 0) {
    // Create all missing records
    await Record.bulkCreate(toCreate, { ignoreDuplicates: true });
  }
}

/**
 * Finds all records for a given player id.
 * These records can be optionally filtered by period and metric.
 */
async function getPlayerRecords(playerId: number, filter: PlayerRecordsFilter): Promise<Record[]> {
  const { period, metric } = filter;

  if (period && !isValidPeriod(period)) {
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
  const { metric, period, playerBuild, playerType, country } = filter;
  const countryCode = country ? geoService.find(country)?.code : null;

  if (!period || !isValidPeriod(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  if (playerType && !PLAYER_TYPES.includes(playerType as PlayerType)) {
    throw new BadRequestError(`Invalid player type: ${playerType}.`);
  }

  if (playerBuild && !PLAYER_BUILDS.includes(playerBuild as PlayerBuild)) {
    throw new BadRequestError(`Invalid player build: ${playerBuild}.`);
  }

  if (country && !countryCode) {
    throw new BadRequestError(
      `Invalid country. You must either supply a valid code or name, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    );
  }

  const query = buildQuery({ type: playerType, build: playerBuild, country: countryCode });

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (query.type && query.type === PlayerType.IRONMAN) {
    query.type = { [Op.or]: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
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

  if (!period || !isValidPeriod(period)) {
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
