import { keyBy, mapValues } from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';
import { Delta, InitialValues, Player, Snapshot } from '../../../database/models';
import { Pagination } from '../../../types';
import { ALL_METRICS, PERIODS, PLAYER_BUILDS, PLAYER_TYPES } from '../../constants';
import { BadRequestError } from '../../errors';
import { getMeasure, getRankKey, getValueKey, isBoss, isSkill, isVirtual } from '../../util/metrics';
import { round } from '../../util/numbers';
import { buildQuery } from '../../util/query';
import * as efficiencyService from './efficiency.service';
import * as playerService from './player.service';
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

function parseNum(key: string, val: string) {
  return isVirtual(key) ? parseFloat(val) : parseInt(val);
}

async function syncDeltas(player: Player, latestSnapshot: Snapshot) {
  const initialValues = await syncInitialValues(player.id, latestSnapshot);

  await Promise.all(
    PERIODS.map(async period => {
      const startingDate = moment().subtract(getSeconds(period), 'seconds').toDate();
      const startSnapshot = await snapshotService.findFirstSince(player.id, startingDate);

      const currentDelta = await Delta.findOne({
        where: { playerId: player.id, period, indicator: 'value' }
      });

      const newDelta = {
        playerId: player.id,
        indicator: 'value',
        period,
        startedAt: startSnapshot.createdAt,
        endedAt: latestSnapshot.createdAt
      };

      const periodDiffs = diff(startSnapshot, latestSnapshot, initialValues, player);

      ALL_METRICS.forEach(metric => {
        newDelta[metric] = periodDiffs[metric][getMeasure(metric)].gained;
      });

      // If player doesn't have a delta for this period
      // on the database, create it, otherwise just update it
      if (!currentDelta) {
        await Delta.create({ ...newDelta });
      } else {
        await currentDelta.update({ ...newDelta });
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
  initial?: InitialValues,
  player?: Player
) {
  if (!PERIODS.includes(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  const periodStartDate = new Date(Date.now() - getSeconds(period) * 1000);
  const initialValues = initial || (await InitialValues.findOne({ where: { playerId } }));
  const latestSnapshot = latest || (await snapshotService.findLatest(playerId));
  const targetPlayer = player || (await playerService.findById(playerId));

  const startSnapshot = await snapshotService.findFirstSince(playerId, periodStartDate);

  if (!startSnapshot || !latestSnapshot) {
    return { period, startsAt: null, endsAt: null, data: emptyDiff() };
  }

  return {
    period,
    startsAt: startSnapshot.createdAt,
    endsAt: latestSnapshot.createdAt,
    data: diff(startSnapshot, latestSnapshot, initialValues, targetPlayer)
  };
}

/**
 * Gets the all the player deltas (gains), for every period.
 */
async function getPlayerDeltas(playerId: number) {
  const initial = await InitialValues.findOne({ where: { playerId } });
  const latest = await snapshotService.findLatest(playerId);
  const player = await playerService.findById(playerId);

  const periodDeltas = await Promise.all(
    PERIODS.map(async period => {
      const deltas = await getPlayerPeriodDeltas(playerId, period, latest, initial, player);
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
    gained: Math.max(0, parseNum(metric, d[metric])),
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
    gained: Math.max(0, parseNum(metric, d[metric])),
    player: d.player
  }));
}

/**
 * Calculate the difference between two snapshots,
 * taking untracked values into consideration. (via initial values)
 */
function diff(start: Snapshot, end: Snapshot, initial: InitialValues, player: Player) {
  const diffObj = {};
  const fixedStart = {};

  // To prevent boss/activity/virtual values from jumping from untracked (-1)
  // to tracked (high number), the "start" value of each metric is either
  // fetched from the start snapshot or the player's initial values.
  // So before calculating the start to end diffs, we must first "fix" the start values.
  ALL_METRICS.forEach(metric => {
    const rankKey = getRankKey(metric);
    const valueKey = getValueKey(metric);

    const initialRank = initial ? initial[rankKey] : -1;
    const initialValue = initial ? initial[valueKey] : -1;

    const startValue = parseNum(metric, start[valueKey] === -1 ? initialValue : start[valueKey]);
    const startRank = start[rankKey] === -1 && !isSkill(metric) ? initialRank : start[rankKey];

    fixedStart[rankKey] = startRank;
    fixedStart[valueKey] = startValue;
  });

  // After fixing the start values, we convert it into a temporary snapshot
  const fixedStartSnapshot = Snapshot.build(fixedStart);

  // With this new fixed start snapshot, we calculate start and end EHP/EHB values
  const startEfficiencyMap = efficiencyService.calcSnapshotVirtuals(player, fixedStartSnapshot);
  const endEfficiencyMap = efficiencyService.calcSnapshotVirtuals(player, end);

  const startEHP = efficiencyService.calculateEHP(fixedStartSnapshot, player.type, player.build);
  const startEHB = efficiencyService.calculateEHB(fixedStartSnapshot, player.type, player.build);
  const endEHP = efficiencyService.calculateEHP(end, player.type, player.build);
  const endEHB = efficiencyService.calculateEHB(end, player.type, player.build);

  ALL_METRICS.forEach(metric => {
    const rankKey = getRankKey(metric);
    const valueKey = getValueKey(metric);

    const startValue = parseNum(metric, fixedStart[valueKey]);
    const startRank = fixedStart[rankKey];

    const endValue = parseNum(metric, end[valueKey]);
    const endRank = end[rankKey];

    // Do not use initial ranks for skill, to prevent -1 ranks
    // introduced by https://github.com/wise-old-man/wise-old-man/pull/93 from creating crazy diffs
    const gainedRank = isSkill(metric) && start[rankKey] === -1 ? 0 : endRank - startRank;
    const gainedValue = round(endValue - startValue, 5);

    // Calculate EHP/EHB diffs
    const startEfficiency = startEfficiencyMap[metric];
    const endEfficiency = endEfficiencyMap[metric];
    const gainedEfficiency = round(endEfficiency - startEfficiency, 5);

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

    // If this metric is a skill, add it's ehp data
    if (isSkill(metric)) {
      diffObj[metric].ehp = {
        start: startEfficiency,
        end: endEfficiency,
        gained: gainedEfficiency
      };
    }

    // If this metric is a boss, add it's ehb data
    if (isBoss(metric)) {
      diffObj[metric].ehb = {
        start: startEfficiency,
        end: endEfficiency,
        gained: gainedEfficiency
      };
    }
  });

  diffObj['ehp'].value = {
    start: startEHP,
    end: endEHP,
    gained: round(endEHP - startEHP, 5)
  };

  diffObj['ehb'].value = {
    start: startEHB,
    end: endEHB,
    gained: round(endEHB - startEHB, 5)
  };

  // Set overall EHP, since the overall EHP is the total EHP
  diffObj['overall'].ehp = { ...diffObj['ehp'].value };

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
