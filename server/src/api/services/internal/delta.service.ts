import { keyBy, mapValues } from 'lodash';
import moment from 'moment';
import { QueryTypes } from 'sequelize';
import { sequelize } from '../../../database';
import { Delta, InitialValues, Player, Snapshot } from '../../../database/models';
import * as queries from '../../../database/queries';
import { ALL_METRICS, PERIODS, PLAYER_BUILDS, PLAYER_TYPES } from '../../constants';
import { BadRequestError, ServerError } from '../../errors';
import { getMeasure, getRankKey, getValueKey, isSkill } from '../../util/metrics';
import * as snapshotService from './snapshot.service';

const DELTA_INDICATORS = ['value', 'rank', 'efficiency'];

const DAY_IN_SECONDS = 86400;
const WEEK_IN_SECONDS = 604800;
const MONTH_IN_SECONDS = 2678400; // month = 31 days (like CML)
const YEAR_IN_SECONDS = 31556926;

async function syncDeltas(playerId: number, period: string, latest: Snapshot, initial: InitialValues) {
  // prettier-ignore
  const startingDate = moment().subtract(1, period as any).toDate();
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
        endedAt: latest.createdAt
      }
    ])
  );

  const toCreate = [];
  const toUpdate = [];

  ALL_METRICS.forEach(metric => {
    const rankKey = getRankKey(metric);
    const valueKey = getValueKey(metric);

    const initialRank = initial ? initial[rankKey] : -1;
    const initialValue = initial ? initial[valueKey] : -1;

    const endValue = parseInt(latest[valueKey], 10);
    const endRank = latest[rankKey];
    // TODO: const endEfficiency = ...

    const startValue = parseInt(first[valueKey] === -1 ? initialValue : first[valueKey], 10);
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
  await Promise.all(
    toUpdate.map(async ({ current, updated }) => {
      await current.update({ ...updated });
    })
  );

  // Create all missing deltas
  await Delta.bulkCreate(toCreate, { ignoreDuplicates: true });
}

async function syncInitialValues(playerId: number, latest: Snapshot): Promise<InitialValues> {
  // Find or create (if doesn't exist) the player's initial values
  const [initial] = await InitialValues.findOrCreate({ where: { playerId } });

  mapValues(latest, (value, key) => {
    if (value > -1 && initial[key] === -1) initial[key] = value;
  });

  await initial.save();

  return initial;
}

/**
 * Get all the player deltas (gains) for a specific time period.
 */
async function getPlayerPeriodDeltas(playerId: number, period: string) {
  if (!playerId) {
    throw new BadRequestError('Invalid player id.');
  }

  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  const deltas = await Delta.findAll({ where: { playerId, period } });

  // TODO: remove in a few weeks
  // If the player hasn't been updated since this update came out
  // use the legacy deltas calculations.
  if (!deltas || deltas.length < DELTA_INDICATORS.length) {
    const legacyGains = await getPlayerPeriodDeltasLegacy(playerId, period);
    return legacyGains;
  }

  const latest = await snapshotService.findLatest(playerId);

  const rankDeltas = deltas.find(d => d.indicator === 'rank');
  const valueDeltas = deltas.find(d => d.indicator === 'value');

  const formattedData = Object.fromEntries(
    ALL_METRICS.map(metric => {
      const rankEnd = parseInt(latest[getRankKey(metric)]);
      const rankGained = parseInt(rankDeltas[metric] || 0);
      const rankStart = rankEnd - rankGained;

      const valueEnd = parseInt(latest[getValueKey(metric)]);
      const valueGained = parseInt(valueDeltas[metric] || 0);
      const valueStart = valueEnd - valueGained;

      return [
        metric,
        {
          rank: {
            start: rankStart,
            end: rankEnd,
            gained: rankGained
          },
          [getMeasure(metric)]: {
            start: valueStart,
            end: valueEnd,
            gained: valueGained
          }
        }
      ];
    })
  );

  return {
    period,
    startsAt: deltas[0].startedAt,
    endsAt: deltas[0].endedAt,
    data: formattedData
  };
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
async function getPlayerPeriodDeltasLegacy(playerId, period, initialVals = null) {
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
 * Gets the all the player deltas (gains), for every period.
 */
async function getPlayerDeltas(playerId: number) {
  const periodDeltas = await Promise.all(
    PERIODS.map(async period => {
      const deltas = await getPlayerPeriodDeltas(playerId, period);
      return { period, deltas };
    })
  );

  // Turn an array of deltas, into an object, using the period as a key,
  // then include only the deltas array in the final object, not the period fields
  return mapValues(keyBy(periodDeltas, 'period'), p => p.deltas);
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
  syncInitialValues,
  syncDeltas
};
