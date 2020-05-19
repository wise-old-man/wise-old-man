const _ = require('lodash');
const moment = require('moment');
const { QueryTypes } = require('sequelize');
const PERIODS = require('../../constants/periods');
const PLAYER_TYPES = require('../../constants/playerTypes');
const { ALL_METRICS, getRankKey, getValueKey, getMeasure, isSkill } = require('../../constants/metrics');
const { BadRequestError, ServerError } = require('../../errors');
const { durationBetween } = require('../../util/dates');
const { Player, Delta, Snapshot, InitialValues, sequelize } = require('../../../database');
const snapshotService = require('../snapshots/snapshot.service');

const DAY_IN_SECONDS = 86400;
const WEEK_IN_SECONDS = 604800;
const MONTH_IN_SECONDS = 2678400; // month = 31 days (like CML)
const YEAR_IN_SECONDS = 31556926;

// DELETE
async function syncDeltas() {}

async function getAllDeltas() {}

async function getDelta() {}

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

  const query = `
        SELECT
          player.id as "playerId",
          player.username,
          player.type,
          c."minDate" AS "startDate",
          c."maxDate" AS "endDate",
          c."endValue",
          GREATEST(i."initialValue", c."startValue") AS  "startValue" ,
          (c."endValue" - GREATEST(i."initialValue", c."startValue")) AS gained
        FROM public.players player
        JOIN (
          SELECT "playerId",
              MIN("createdAt") AS "minDate",
              MIN("${metricKey}") AS "startValue",
              MAX("createdAt") AS "maxDate",
              MAX("${metricKey}") AS "endValue"
          FROM public.snapshots
          WHERE "createdAt" >= date_trunc('second', NOW() - INTERVAL '${seconds} seconds')
          GROUP BY "playerId"
        ) c ON player.id = c."playerId"
        JOIN (
        SELECT "playerId" AS "pId", MAX("${metricKey}") AS "initialValue"
        FROM "initialValues"
        GROUP BY "pId"
        ) i ON player.id = i."pId"
        WHERE ${typeCondition}
        ORDER BY gained DESC
        LIMIT 20 
  `;

  const results = await sequelize.query(query, { type: QueryTypes.SELECT });
  return results;
}

/**
 * Gets the all the best deltas for a specific metric.
 * Optionally, the deltas can be filtered by the playerType.
 */
async function getLeaderboard(metric, periods, playerType) {
  const periodsList = periods && JSON.parse(periods);
  const periodsToSelect = Array.isArray(periodsList) && periodsList.length > 0 ? periodsList : PERIODS;

  const partials = await Promise.all(
    periodsToSelect.map(async period => {
      const list = await getPeriodLeaderboard(metric, period, playerType);
      return { period, deltas: list };
    })
  );

  // Turn an array of deltas, into an object, using the period as a key,
  // then include only the deltas array in the final object, not the period fields
  return _.mapValues(_.keyBy(partials, 'period'), p => p.deltas);
}

async function getCompetitionLeaderboard() {}

async function getMonthlyTop() {}

// DELETE
async function processCompetitionDeltas() {}

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

exports.syncDeltas = syncDeltas;
exports.getAllDeltas = getAllDeltas;
exports.getDelta = getDelta;
exports.getPeriodLeaderboard = getPeriodLeaderboard;
exports.getLeaderboard = getLeaderboard;
exports.getMonthlyTop = getMonthlyTop;
exports.processCompetitionDeltas = processCompetitionDeltas;
