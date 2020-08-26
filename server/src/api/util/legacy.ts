import { QueryTypes } from 'sequelize';
import { sequelize } from '../../database';
import { InitialValues } from '../../database/models';
import * as queries from '../../database/queries';
import { ALL_METRICS, PERIODS } from '../constants';
import { BadRequestError, ServerError } from '../errors';
import { getMeasure, getRankKey, getValueKey, isSkill } from './metrics';

export const DAY_IN_SECONDS = 86400;
export const WEEK_IN_SECONDS = 604800;
export const MONTH_IN_SECONDS = 2678400; // month = 31 days (like CML)
export const YEAR_IN_SECONDS = 31556926;

export function getSeconds(period) {
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

export function emptyDiff() {
  const diffObj = {};

  ALL_METRICS.forEach(metric => {
    diffObj[metric] = {
      rank: { start: 0, end: 0, gained: 0 },
      [getMeasure(metric)]: { start: 0, end: 0, gained: 0 }
    };
  });

  return diffObj;
}

/**
 * Calculate the difference between two snapshots,
 * taking untracked values into consideration. (via initial values)
 */
export function diff(start, end, initial) {
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

/**
 * Legacy player gains.
 *
 * Get a player delta for a specific period.
 * Note: if initialVals is undefined, this method will force-fetch it.
 *
 * TODO: this method should be removed in a few weeks after
 * most players have been updated
 */
export async function getPlayerPeriodDeltasLegacy(playerId, period, initialVals = null) {
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
