import { keyBy, mapValues } from 'lodash';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../../database';
import { InitialValues, Player } from '../../../database/models';
import * as queries from '../../../database/queries';
import { ALL_METRICS, PERIODS, PLAYER_BUILDS, PLAYER_TYPES } from '../../constants';
import { BadRequestError, ServerError } from '../../errors';
import { getMeasure, getRankKey, getValueKey, isSkill } from '../../util/metrics';
import * as snapshotService from './snapshot.service';

const DAY_IN_SECONDS = 86400;
const WEEK_IN_SECONDS = 604800;
const MONTH_IN_SECONDS = 2678400; // month = 31 days (like CML)
const YEAR_IN_SECONDS = 31556926;

async function syncInitialValues(playerId) {
  const latestSnapshot = await snapshotService.findLatest(playerId);

  // Find or create (if doesn't exist) the player's initial values
  const [initialValues] = await InitialValues.findOrCreate({ where: { playerId } });

  const newInitialValues = {};

  // Find which values are known for the first time
  mapValues(latestSnapshot.toJSON(), (value, key) => {
    if (value > -1 && initialValues[key] === -1) newInitialValues[key] = value;
  });

  // Update the player's initial values, with the newly discovered fields
  if (Object.keys(newInitialValues).length > 0) {
    await initialValues.update(newInitialValues);
  }
}

/**
 * Get a player delta for a specific period.
 * Note: if initialVals is undefined, this method will force-fetch it.
 */
async function getPlayerPeriodDeltas(playerId, period, initialVals = null) {
  if (!playerId) {
    throw new BadRequestError('Invalid player id.');
  }

  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  const initialValues = initialVals || (await InitialValues.findOne({ where: { playerId } }));
  const seconds = getSeconds(period);

  const results = await sequelize.query(queries.GET_PLAYER_DELTA, {
    replacements: { seconds, playerId },
    type: QueryTypes.SELECT
  });

  if (!results) {
    throw new ServerError(`Couldn't find ${period} deltas for that player.`);
  }

  if (results.length < 2) {
    return {
      period,
      startsAt: null,
      endsAt: null,
      data: emptyDiff()
    };
  }

  const [start, end]: any = results;
  const diffs = diff(start, end, initialValues);

  return {
    period,
    startsAt: start.createdAt,
    endsAt: end.createdAt,
    data: diffs
  };
}

/**
 * Gets the best deltas for a specific metric and period.
 * Optionally, the deltas can be filtered by the playerType and playerBuild.
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

  const metricKey = getValueKey(metric);
  const seconds = getSeconds(period);

  const typeCondition = type ? `player.type = '${type}'` : "NOT player.type = 'unknown'";
  const buildCondition = build ? `AND player.build = '${build}'` : '';

  const query = queries.GET_PERIOD_LEADERBOARD(metricKey, typeCondition, buildCondition);

  const results = await sequelize.query(query, {
    replacements: { seconds },
    type: QueryTypes.SELECT
  });

  return results.map((r: any) => {
    return {
      startDate: r.startDate as string,
      endDate: r.endDate as string,
      startValue: parseInt(r.startValue, 10),
      endValue: parseInt(r.endValue, 10),
      gained: parseInt(r.gained, 10),
      player: Player.build(r)
    };
  });
}

/**
 * Gets the all the deltas for a specific playerId.
 */
async function getPlayerDeltas(playerId) {
  const initialValues = await InitialValues.findOne({ where: { playerId } });

  const partials = await Promise.all(
    PERIODS.map(async period => {
      const list = await getPlayerPeriodDeltas(playerId, period, initialValues);
      return { period, deltas: list };
    })
  );

  // Turn an array of deltas, into an object, using the period as a key,
  // then include only the deltas array in the final object, not the period fields
  return mapValues(keyBy(partials, 'period'), p => p.deltas);
}

async function getCompetitionLeaderboard(competition, playerIds) {
  if (!competition) {
    throw new BadRequestError(`Invalid competition.`);
  }

  if (!playerIds || playerIds.length === 0) {
    return [];
  }

  const metricKey = getValueKey(competition.metric);
  const ids = playerIds.join(',');

  const query = queries.GET_COMPETITION_LEADERBOARD(metricKey, ids);

  const results = await sequelize.query(query, {
    replacements: {
      startsAt: competition.startsAt.toISOString(),
      endsAt: competition.endsAt.toISOString()
    },
    type: QueryTypes.SELECT
  });

  return results.map((r: any) => ({
    ...r,
    endValue: parseInt(r.endValue, 10),
    startValue: parseInt(r.startValue, 10),
    gained: parseInt(r.gained, 10)
  }));
}

/**
 * Gets the best deltas for a specific metric, period and list of players.
 * Note: this is useful for group statistics
 */
async function getGroupLeaderboard(metric, period, playerIds, pagination) {
  const metricKey = getValueKey(metric);
  const seconds = getSeconds(period);
  const ids = playerIds.join(',');

  const query = queries.GET_GROUP_LEADERBOARD(metricKey, ids);

  const results = await sequelize.query(query, {
    replacements: { seconds, ...pagination },
    type: QueryTypes.SELECT
  });

  return results.map((r: any) => ({
    ...r,
    endValue: parseInt(r.endValue, 10),
    startValue: parseInt(r.startValue, 10),
    gained: parseInt(r.gained, 10)
  }));
}

function getSeconds(period) {
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

/**
 * Calculate the difference between two snapshots,
 * taking untracked values into consideration. (via initial values)
 */
function diff(start, end, initial) {
  const diffObj = {};

  ALL_METRICS.forEach(metric => {
    const rankKey = getRankKey(metric);
    const valueKey = getValueKey(metric);

    const initialRank = initial ? initial[rankKey] : -1;
    const initialValue = initial ? initial[valueKey] : -1;

    const endValue = parseInt(end[valueKey], 10);
    const endRank = end[rankKey];

    const startValue = parseInt(start[valueKey] === -1 ? initialValue : start[valueKey], 10);
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
  getLeaderboard,
  getGroupLeaderboard,
  getCompetitionLeaderboard,
  syncInitialValues
};
