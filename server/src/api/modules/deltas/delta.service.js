const _ = require('lodash');
const PERIODS = require('../../constants/periods');
const { ALL_METRICS, getRankKey, getValueKey, getMeasure } = require('../../constants/metrics');
const { BadRequestError, ServerError } = require('../../errors');
const { durationBetween } = require('../../util/dates');
const { Player, Delta, Snapshot, InitialValues, sequelize } = require('../../../database');
const snapshotService = require('../snapshots/snapshot.service');

/**
 * Converts a Delta instance into a JSON friendlier format
 */
function format(delta, diffs) {
  const { period, updatedAt, startSnapshot, endSnapshot, initialValues } = delta;

  const startsAt = startSnapshot && new Date(startSnapshot.createdAt);
  const endsAt = endSnapshot && new Date(endSnapshot.createdAt);

  const interval = durationBetween(startsAt, endsAt);

  const obj = {
    period,
    updatedAt,
    startsAt,
    endsAt,
    interval,
    data: {}
  };

  if (startSnapshot && endSnapshot && diffs) {
    ALL_METRICS.forEach(s => {
      const rankKey = getRankKey(s);
      const valueKey = getValueKey(s);

      const initialRank = initialValues ? initialValues[rankKey] : -1;
      const initialValue = initialValues ? initialValues[valueKey] : -1;

      const endValue = endSnapshot[valueKey];
      const endRank = endSnapshot[rankKey];

      const startValue = startSnapshot[valueKey] === -1 ? initialValue : startSnapshot[valueKey];
      const startRank = startSnapshot[rankKey] === -1 ? initialRank : startSnapshot[rankKey];

      obj.data[s] = {
        rank: {
          start: startRank,
          end: endRank,
          delta: diffs[rankKey]
        },
        [getMeasure(s)]: {
          start: startValue,
          end: endValue,
          delta: diffs[valueKey]
        }
      };
    });
  }

  return obj;
}

/**
 * Adds all missing deltas (for new players) or updates existing ones.
 */
async function syncDeltas(playerId) {
  const latestSnapshot = await snapshotService.findLatest(playerId);

  // Find or create (if doesn't exist) the player's initial values
  // For information on what this model is, read the documentation on initialValues.model.js
  const [initialValues] = await InitialValues.findOrCreate({ where: { playerId } });

  const newInitialValues = {};

  // Find which values are known for the first time
  _.mapValues(latestSnapshot.toJSON(), (value, key) => {
    if (value > -1 && initialValues[key] === -1) newInitialValues[key] = value;
  });

  // Update the player's initial values, with the newly discovered fields
  if (Object.keys(newInitialValues).length > 0) {
    await initialValues.update(newInitialValues);
  }

  await Promise.all(
    PERIODS.map(async period => {
      const start = await snapshotService.findFirstIn(playerId, period);
      const delta = await updateDelta(playerId, period, start, latestSnapshot, initialValues);

      return delta;
    })
  );
}

async function updateDelta(playerId, period, startSnapshot, endSnapshot, initialValues) {
  const [delta] = await Delta.findOrCreate({ where: { playerId, period } });

  const newDelta = await delta.update({
    updatedAt: new Date(),
    startSnapshotId: startSnapshot.id,
    endSnapshotId: endSnapshot.id,
    initialValuesId: initialValues.id
  });

  return newDelta;
}

/**
 * Get all the player's deltas, and place them into an object,
 * using the period as key. Like:
 * {
 *    day: {...},
 *    week: {...},
 *    etc
 * }
 */
async function getAllDeltas(playerId) {
  if (!playerId) {
    throw new BadRequestError('Invalid player id.');
  }

  const deltas = await Delta.findAll({
    where: { playerId },
    include: [
      { model: Snapshot, as: 'startSnapshot' },
      { model: Snapshot, as: 'endSnapshot' },
      { model: InitialValues, as: 'initialValues' },
      { model: Player }
    ]
  });

  if (!deltas || deltas.length === 0) {
    throw new ServerError(`Couldn't find deltas for that player.`);
  }

  // Turn an array of deltas, into an object, using the period as a key,
  // then include the diffs and format the delta
  return _.mapValues(_.keyBy(deltas, 'period'), delta => {
    const { startSnapshot, endSnapshot, initialValues } = delta;
    return format(delta, snapshotService.diff(startSnapshot, endSnapshot, initialValues));
  });
}

/**
 * Get a player delta for a specific period.
 */
async function getDelta(playerId, period) {
  if (!playerId) {
    throw new BadRequestError('Invalid player id.');
  }

  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  const delta = await Delta.findOne({
    where: { playerId, period },
    include: [
      { model: Snapshot, as: 'startSnapshot' },
      { model: Snapshot, as: 'endSnapshot' },
      { model: InitialValues, as: 'initialValues' },
      { model: Player }
    ]
  });

  if (!delta) {
    throw new ServerError(`Couldn't find ${period} deltas for that player.`);
  }

  const { startSnapshot, endSnapshot, initialValues } = delta;
  return format(delta, snapshotService.diff(startSnapshot, endSnapshot, initialValues));
}

/**
 * Gets the all the best deltas for a specific metric.
 * Optionally, the deltas can be filtered by the playerType.
 */
async function getLeaderboard(metric, playerType) {
  const partials = await Promise.all(
    PERIODS.map(async period => {
      const list = await getPeriodLeaderboard(metric, period, playerType);
      return { period, deltas: list };
    })
  );

  // Turn an array of deltas, into an object, using the period as a key,
  // then include only the deltas array in the final object, not the period fields
  return _.mapValues(_.keyBy(partials, 'period'), p => p.deltas);
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

  const metricKey = getValueKey(metric);

  // Postgres doesn't support the use of calculated column aliases
  // in "order" clauses, so to work around it, we order by the difference
  // of the two snapshots, and then calculate the difference again later

  const deltas = await Delta.findAll({
    where: { period },
    order: [
      [
        sequelize.literal(
          `"endSnapshot"."${metricKey}" - GREATEST("initialValues"."${metricKey}", "startSnapshot"."${metricKey}")`
        ),
        'DESC'
      ]
    ],
    limit: 20,
    include: [
      { model: Player, where: playerType && { type: playerType } },
      { model: InitialValues, as: 'initialValues', attributes: [metricKey] },
      { model: Snapshot, as: 'startSnapshot', attributes: [metricKey] },
      { model: Snapshot, as: 'endSnapshot', attributes: [metricKey] }
    ]
  });

  const formattedDeltas = deltas.map(delta => {
    const { player, startSnapshot, endSnapshot, initialValues } = delta;
    const diff = snapshotService.diff(startSnapshot, endSnapshot, initialValues);

    return {
      playerId: player.id,
      username: player.username,
      type: player.type,
      gained: diff[metricKey]
    };
  });

  return formattedDeltas;
}

/**
 * Gets the best OVERALL monthly delta from a list of players.
 */
async function getMonthlyTop(playerIds) {
  const metricKey = `overallExperience`;

  // Postgres doesn't support the use of calculated column aliases
  // in "order" clauses, so to work around it, we order by the difference
  // of the two snapshots, and then calculate the difference again later

  const deltas = await Delta.findAll({
    where: { playerId: playerIds, period: 'month' },
    order: [
      [
        sequelize.literal(
          `"endSnapshot"."${metricKey}" -  GREATEST("initialValues"."${metricKey}", "startSnapshot"."${metricKey}")`
        ),
        'DESC'
      ]
    ],
    limit: 1,
    include: [
      { model: Player },
      { model: InitialValues, as: 'initialValues', attributes: [metricKey] },
      { model: Snapshot, as: 'startSnapshot', attributes: [metricKey] },
      { model: Snapshot, as: 'endSnapshot', attributes: [metricKey] }
    ]
  });

  if (!deltas || deltas.length === 0) {
    throw new BadRequestError('None of the group members are tracked.');
  }

  const formattedDeltas = deltas.map(delta => {
    const { player, startSnapshot, endSnapshot, initialValues } = delta;
    const diff = snapshotService.diff(startSnapshot, endSnapshot, initialValues);

    return {
      playerId: player.id,
      username: player.username,
      type: player.type,
      gained: diff[metricKey]
    };
  });

  return formattedDeltas[0];
}

function processCompetitionDeltas(metricKey, participations) {
  const deltas = participations.map(delta => {
    const { player, startSnapshot, endSnapshot, initialValues } = delta;

    if (!startSnapshot || !endSnapshot) {
      return {
        playerId: player.id,
        progress: { start: 0, end: 0, delta: 0 }
      };
    }

    const diff = snapshotService.diff(startSnapshot, endSnapshot, initialValues);

    const initialValue = initialValues ? initialValues[metricKey] : -1;

    return {
      playerId: player.id,
      progress: {
        start: startSnapshot[metricKey] === -1 ? initialValue : startSnapshot[metricKey],
        end: endSnapshot[metricKey],
        delta: diff[metricKey]
      }
    };
  });

  return deltas;
}

exports.syncDeltas = syncDeltas;
exports.getAllDeltas = getAllDeltas;
exports.getDelta = getDelta;
exports.getPeriodLeaderboard = getPeriodLeaderboard;
exports.getLeaderboard = getLeaderboard;
exports.getMonthlyTop = getMonthlyTop;
exports.processCompetitionDeltas = processCompetitionDeltas;
