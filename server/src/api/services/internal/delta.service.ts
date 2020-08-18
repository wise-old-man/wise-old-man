import { keyBy, mapValues } from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';
import { Delta, InitialValues, Player, Snapshot } from '../../../database/models';
import { Pagination } from '../../../types';
import { ALL_METRICS, PERIODS, PLAYER_BUILDS, PLAYER_TYPES } from '../../constants';
import { BadRequestError } from '../../errors';
import { getMeasure, getRankKey, getValueKey, isEfficiency, isSkill } from '../../util/metrics';
import { buildQuery } from '../../util/query';
import * as snapshotService from './snapshot.service';

interface GlobalDeltasFilter {
  period?: string;
  metric?: string;
  playerType?: string;
  playerBuild?: string;
}

interface GroupDeltasFilter {
  playerIds: number[];
  period?: string;
  metric?: string;
}

const DELTA_INDICATORS = ['value', 'rank', 'efficiency'];

export const DAY_IN_SECONDS = 86400;
export const WEEK_IN_SECONDS = 604800;
export const MONTH_IN_SECONDS = 2678400; // month = 31 days (like CML)
export const YEAR_IN_SECONDS = 31556926;

function getSeconds(period: string) {
  switch (period) {
    case 'day':
      return DAY_IN_SECONDS;
    case 'week':
      return WEEK_IN_SECONDS;
    case 'month':
      return MONTH_IN_SECONDS;
    case 'year':
      return YEAR_IN_SECONDS;
    default:
      return -1;
  }
}

async function syncDeltas(latestSnapshot: Snapshot) {
  const { playerId } = latestSnapshot;
  const initialValues = await syncInitialValues(playerId, latestSnapshot);

  await Promise.all(
    PERIODS.map(async period => {
      const startingDate = moment().subtract(getSeconds(period), 'seconds').toDate();
      const first = await snapshotService.findFirstSince(playerId, startingDate);

      const currentDeltas = await Delta.findAll({ where: { playerId, period } });

      const deltaDefinitions = Object.fromEntries(
        DELTA_INDICATORS.map(indicator => [
          indicator,
          {
            playerId,
            period,
            indicator,
            startedAt: first.createdAt,
            endedAt: latestSnapshot.createdAt
          }
        ])
      );

      const toCreate = [];
      const toUpdate = [];

      ALL_METRICS.forEach(metric => {
        const rankKey = getRankKey(metric);
        const valueKey = getValueKey(metric);

        const initialRank = initialValues ? initialValues[rankKey] : -1;
        const initialValue = initialValues ? initialValues[valueKey] : -1;

        const endValue = parseInt(latestSnapshot[valueKey]);
        const endRank = latestSnapshot[rankKey];
        // TODO: const endEfficiency = ...

        const startValue = parseInt(first[valueKey] === -1 ? initialValue : first[valueKey]);
        const startRank = first[rankKey] === -1 && !isSkill(metric) ? initialRank : first[rankKey];
        // TODO: const startEfficiency = ...

        // Do not use initial ranks for skill, to prevent -1 ranks
        // introduced by https://github.com/wise-old-man/wise-old-man/pull/93 from creating crazy diffs
        const gainedRank = isSkill(metric) && first[rankKey] === -1 ? 0 : endRank - startRank;
        const gainedValue = endValue - startValue;
        // TODO: const gainedEfficiency = ...

        deltaDefinitions['value'][metric] = gainedValue;
        deltaDefinitions['rank'][metric] = gainedRank;
        deltaDefinitions['efficiency'][metric] = 0;
      });

      DELTA_INDICATORS.forEach(indicator => {
        const delta = currentDeltas.find(c => c.indicator === indicator);

        if (!delta) {
          toCreate.push(deltaDefinitions[indicator]);
        } else {
          toUpdate.push({ current: delta, updated: deltaDefinitions[indicator] });
        }
      });

      // Update all "outdated deltas"
      if (toUpdate.length > 0) {
        await Promise.all(
          toUpdate.map(async ({ current, updated }) => {
            await current.update({ ...updated });
          })
        );
      }

      // Create all missing deltas
      if (toCreate.length > 0) {
        await Delta.bulkCreate(toCreate, { ignoreDuplicates: true });
      }
    })
  );
}

async function syncInitialValues(playerId: number, latest: Snapshot) {
  // Find or create (if doesn't exist) the player's initial values
  const [initial] = await InitialValues.findOrCreate({ where: { playerId } });

  mapValues(latest.toJSON(), (value, key) => {
    if (value > -1 && initial[key] === -1) {
      initial[key] = value;
    }
  });

  await initial.save();
  return initial;
}

/**
 * Get all the player deltas (gains) for a specific time period.
 */
async function getPlayerPeriodDeltas(
  playerId: number,
  period: string,
  latest?: Snapshot,
  initial?: InitialValues
) {
  if (!PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  const periodStartDate = new Date(Date.now() - getSeconds(period) * 1000);
  const initialValues = initial || (await InitialValues.findOne({ where: { playerId } }));
  const latestSnapshot = latest || (await snapshotService.findLatest(playerId));

  const startSnapshot = await snapshotService.findFirstSince(playerId, periodStartDate);

  if (!startSnapshot || !latestSnapshot) {
    return { period, startsAt: null, endsAt: null, data: emptyDiff() };
  }

  return {
    period,
    startsAt: startSnapshot.createdAt,
    endsAt: latestSnapshot.createdAt,
    data: diff(startSnapshot, latestSnapshot, initialValues)
  };
}

/**
 * Gets the all the player deltas (gains), for every period.
 */
async function getPlayerDeltas(playerId: number) {
  const initial = await InitialValues.findOne({ where: { playerId } });
  const latest = await snapshotService.findLatest(playerId);

  const periodDeltas = await Promise.all(
    PERIODS.map(async period => {
      const deltas = await getPlayerPeriodDeltas(playerId, period, latest, initial);
      return { period, deltas };
    })
  );

  // Turn an array of deltas, into an object, using the period as a key,
  // then include only the deltas array in the final object, not the period fields
  return mapValues(keyBy(periodDeltas, 'period'), p => p.deltas);
}

/**
 * Gets the best deltas for a specific metric and period.
 * Optionally, these deltas can be filtered by player type and build.
 */
async function getLeaderboard(filter: GlobalDeltasFilter, pagination: Pagination) {
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

  const startingDate = moment().subtract(getSeconds(period), 'seconds').toDate();

  const deltas = await Delta.findAll({
    attributes: [metric, 'startedAt', 'endedAt'],
    where: {
      period,
      indicator: 'value',
      updatedAt: { [Op.gte]: startingDate }
    },
    include: [{ model: Player, where: buildQuery({ type: playerType, build: playerBuild }) }],
    order: [[metric, 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  return deltas.map(d => ({
    startDate: d.startedAt,
    endDate: d.endedAt,
    gained: parseInt(d[metric]),
    player: d.player
  }));
}

/**
 * Gets the best deltas for a specific metric, period and list of players.
 * Note: this is useful for group statistics
 */
async function getGroupLeaderboard(filter: GroupDeltasFilter, pagination: Pagination) {
  const { metric, period, playerIds } = filter;

  // Fetch all deltas for group members
  const deltas = await Delta.findAll({
    attributes: [metric, 'startedAt', 'endedAt'],
    where: { period, indicator: 'value', playerId: playerIds },
    order: [[metric, 'DESC']],
    include: [{ model: Player }],
    limit: pagination.limit,
    offset: pagination.offset
  });

  return deltas.map(d => ({
    startDate: d.startedAt,
    endDate: d.endedAt,
    gained: parseInt(d[metric]),
    player: d.player
  }));
}

/**
 * Calculate the difference between two snapshots,
 * taking untracked values into consideration. (via initial values)
 */
function diff(start: Snapshot, end: Snapshot, initial: InitialValues) {
  const diffObj = {};
  const parseNum = (key, val) => (isEfficiency(key) ? parseFloat(val) : parseInt(val));

  ALL_METRICS.forEach(metric => {
    const rankKey = getRankKey(metric);
    const valueKey = getValueKey(metric);

    const initialRank = initial ? initial[rankKey] : -1;
    const initialValue = initial ? initial[valueKey] : -1;

    const endValue = parseNum(metric, end[valueKey]);
    const endRank = end[rankKey];

    const startValue = parseNum(metric, start[valueKey] === -1 ? initialValue : start[valueKey]);
    const startRank = start[rankKey] === -1 && !isSkill(metric) ? initialRank : start[rankKey];

    // Do not use initial ranks for skill, to prevent -1 ranks
    // introduced by https://github.com/wise-old-man/wise-old-man/pull/93 from creating crazy diffs
    const gainedRank = isSkill(metric) && start[rankKey] === -1 ? 0 : endRank - startRank;
    const gainedValue = endValue - startValue;

    diffObj[metric] = {
      rank: {
        start: startRank,
        end: endRank,
        gained: gainedRank
      },
      [getMeasure(metric)]: {
        start: startValue,
        end: endValue,
        gained: gainedValue
      }
    };
  });

  return diffObj;
}

function emptyDiff() {
  const diffObj = {};

  ALL_METRICS.forEach(metric => {
    diffObj[metric] = {
      rank: { start: 0, end: 0, gained: 0 },
      [getMeasure(metric)]: { start: 0, end: 0, gained: 0 }
    };
  });

  return diffObj;
}

export {
  getPlayerDeltas,
  getPlayerPeriodDeltas,
  getGroupLeaderboard,
  getLeaderboard,
  syncInitialValues,
  syncDeltas
};
