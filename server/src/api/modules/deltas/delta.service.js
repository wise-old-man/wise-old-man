const _ = require("lodash");
const PERIODS = require("../../constants/periods");
const { SKILLS, ALL_METRICS } = require("../../constants/metrics");
const { BadRequestError, ServerError } = require("../../errors");
const { durationBetween } = require("../../util/dates");
const { Player, Delta, Snapshot, sequelize } = require("../../../database");
const snapshotService = require("../snapshots/snapshot.service");

/**
 * Converts a Delta instance into a JSON friendlier format
 */
function format(delta, diffs) {
  const { period, updatedAt, startSnapshot, endSnapshot } = delta;

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
    SKILLS.forEach(s => {
      const rankKey = `${s}Rank`;
      const expKey = `${s}Experience`;

      obj.data[s] = {
        rank: {
          start: startSnapshot[rankKey],
          end: endSnapshot[rankKey],
          delta: diffs[rankKey]
        },
        experience: {
          start: startSnapshot[expKey],
          end: endSnapshot[expKey],
          delta: diffs[expKey]
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

  await Promise.all(
    PERIODS.map(async period => {
      const start = await snapshotService.findFirstIn(playerId, period);
      const delta = await updateDelta(playerId, period, start, latestSnapshot);

      return delta;
    })
  );
}

async function updateDelta(playerId, period, startSnapshot, endSnapshot) {
  const [delta] = await Delta.findOrCreate({ where: { playerId, period } });

  const newDelta = await delta.update({
    updatedAt: new Date(),
    startSnapshotId: startSnapshot.id,
    endSnapshotId: endSnapshot.id
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
    throw new BadRequestError("Invalid player id.");
  }

  const deltas = await Delta.findAll({
    where: { playerId },
    include: [
      { model: Snapshot, as: "startSnapshot" },
      { model: Snapshot, as: "endSnapshot" },
      { model: Player }
    ]
  });

  if (!deltas || deltas.length === 0) {
    throw new ServerError(`Couldn't find  deltas for that player.`);
  }

  // Turn an array of deltas, into an object, using the period as a key,
  // then include the diffs and format the delta
  return _.mapValues(_.keyBy(deltas, "period"), delta =>
    format(delta, snapshotService.diff(delta.startSnapshot, delta.endSnapshot))
  );
}

/**
 * Get a player delta for a specific period.
 */
async function getDelta(playerId, period) {
  if (!playerId) {
    throw new BadRequestError("Invalid player id.");
  }

  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}. Must be one of [${PERIODS}]`);
  }

  const delta = await Delta.findOne({
    where: { playerId, period },
    include: [
      { model: Snapshot, as: "startSnapshot" },
      { model: Snapshot, as: "endSnapshot" },
      { model: Player }
    ]
  });

  if (!delta) {
    throw new ServerError(`Couldn't find ${period} deltas for that player.`);
  }

  const diffs = snapshotService.diff(delta.startSnapshot, delta.endSnapshot);

  return format(delta, diffs);
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
  return _.mapValues(_.keyBy(partials, "period"), p => p.deltas);
}

/**
 * Gets the best deltas for a specific metric and period.
 * Optionally, the deltas can be filtered by the playerType.
 */
async function getPeriodLeaderboard(metric, period, playerType) {
  if (!period || !PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period ${period}. Must be one of ${PERIODS}`);
  }

  if (!metric || !ALL_METRICS.includes(metric)) {
    throw new BadRequestError(`Invalid metric ${metric}.`);
  }

  const metricKey = `${metric}Experience`;

  const deltas = await Delta.findAll({
    attributes: [[sequelize.literal(`endSnapshot.${metricKey} - startSnapshot.${metricKey}`), "gained"]],
    where: { period },
    order: sequelize.literal("gained DESC"),
    limit: 20,
    include: [
      { model: Player, where: playerType && { type: playerType } },
      { model: Snapshot, as: "startSnapshot" },
      { model: Snapshot, as: "endSnapshot" }
    ]
  });

  const formattedDeltas = deltas.map(d => ({
    playerId: d.player.id,
    username: d.player.username,
    type: d.player.type,
    gained: d.toJSON().gained
  }));

  return formattedDeltas;
}

exports.syncDeltas = syncDeltas;
exports.getAllDeltas = getAllDeltas;
exports.getDelta = getDelta;
exports.getPeriodLeaderboard = getPeriodLeaderboard;
exports.getLeaderboard = getLeaderboard;
