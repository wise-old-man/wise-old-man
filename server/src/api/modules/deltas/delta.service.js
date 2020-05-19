const _ = require('lodash');
const { QueryTypes } = require('sequelize');
const PERIODS = require('../../constants/periods');
const PLAYER_TYPES = require('../../constants/playerTypes');
const { ALL_METRICS, getRankKey, getValueKey, getMeasure, isSkill } = require('../../constants/metrics');
const { BadRequestError, ServerError } = require('../../errors');
const { InitialValues, sequelize } = require('../../../database');
const queries = require('./delta.queries');

const DAY_IN_SECONDS = 86400;
const WEEK_IN_SECONDS = 604800;
const MONTH_IN_SECONDS = 2678400; // month = 31 days (like CML)
const YEAR_IN_SECONDS = 31556926;

/**
 * Get a player delta for a specific period.
 * Note: if initialVals is undefined, this method will force-fetch it.
 */
async function getDelta(playerId, period, initialVals = null) {
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

  if (!results || results.length < 2) {
    throw new ServerError(`Couldn't find ${period} deltas for that player.`);
  }

  const [start, end] = results;
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
 * Optionally, the deltas can be filtered by the playerType.
 */
async function getPeriodLeaderboard(metric, period, playerType) {
  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  if (playerType && !PLAYER_TYPES.includes(playerType)) {
    throw new BadRequestError(`Invalid player type: ${playerType}.`);
  }

  const metricKey = getValueKey(metric);
  const seconds = getSeconds(period);
  const typeCondition = playerType ? `player.type = '${playerType}'` : "NOT player.type = 'unknown'";

  const query = queries.GET_PERIOD_LEADERBOARD(metricKey, typeCondition);

  const results = await sequelize.query(query, {
    replacements: { seconds },
    type: QueryTypes.SELECT
  });

  return results.map(r => ({
    ...r,
    endValue: parseInt(r.endValue, 10),
    startValue: parseInt(r.startValue, 10),
    gained: parseInt(r.gained, 10)
  }));
}

/**
 * Gets the the best deltas for a specific metric.
 * Optionally, the deltas can be filtered by the playerType.
 */
async function getLeaderboard(metric, playerType) {
  // Do not include year, as this makes the whole query slower, and is not
  // required for the app
  const periods = ['day', 'week', 'month'];

  const partials = await Promise.all(
    periods.map(async period => {
      console.time(period);
      const list = await getPeriodLeaderboard(metric, period, playerType);
      console.timeEnd(period);
      return { period, deltas: list };
    })
  );

  // Turn an array of deltas, into an object, using the period as a key,
  // then include only the deltas array in the final object, not the period fields
  return _.mapValues(_.keyBy(partials, 'period'), p => p.deltas);
}

/**
 * Gets the all the deltas for a specific playerId.
 */
async function getAllDeltas(playerId) {
  const initialValues = await InitialValues.findOne({ where: { playerId } });

  const partials = await Promise.all(
    PERIODS.map(async period => {
      const list = await getDelta(playerId, period, initialValues);
      return { period, deltas: list };
    })
  );

  // Turn an array of deltas, into an object, using the period as a key,
  // then include only the deltas array in the final object, not the period fields
  return _.mapValues(_.keyBy(partials, 'period'), p => p.deltas);
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

  return results.map(r => ({
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
async function getGroupLeaderboard(metric, period, playerIds, limit = 10000) {
  const metricKey = getValueKey(metric);
  const seconds = getSeconds(period);
  const ids = playerIds.join(',');

  const query = queries.GET_GROUP_LEADERBOARD(metricKey, ids);

  const results = await sequelize.query(query, {
    replacements: { seconds, limit },
    type: QueryTypes.SELECT
  });

  return results.map(r => ({
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
    // introduced by https://github.com/psikoi/wise-old-man/pull/93 from creating crazy diffs
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

exports.getAllDeltas = getAllDeltas;
exports.getDelta = getDelta;
exports.getPeriodLeaderboard = getPeriodLeaderboard;
exports.getLeaderboard = getLeaderboard;
exports.getGroupLeaderboard = getGroupLeaderboard;
exports.getCompetitionLeaderboard = getCompetitionLeaderboard;
