import { keyBy, mapValues } from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';
import { Delta, InitialValues, Player, Snapshot } from '../../../database/models';
import { Pagination } from '../../../types';
import { ALL_METRICS, PERIODS, PLAYER_BUILDS, PLAYER_TYPES } from '../../constants';
import { BadRequestError } from '../../errors';
import { getMilliseconds, parsePeriod } from '../../util/dates';
import { getMeasure, getRankKey, getValueKey, isBoss, isSkill, isVirtual } from '../../util/metrics';
import { round } from '../../util/numbers';
import { buildQuery } from '../../util/query';
import * as geoService from '../external/geo.service';
import * as efficiencyService from './efficiency.service';
import * as playerService from './player.service';
import * as snapshotService from './snapshot.service';

interface GlobalDeltasFilter {
  period?: string;
  metric?: string;
  playerType?: string;
  playerBuild?: string;
  country?: string;
}

interface GroupDeltasFilter {
  playerIds: number[];
  period?: string;
  metric?: string;
}

function parseNum(key: string, val: string) {
  return isVirtual(key) ? parseFloat(val) : parseInt(val);
}

async function syncDeltas(player: Player, latestSnapshot: Snapshot) {
  const initialValues = await syncInitialValues(player.id, latestSnapshot);

  await Promise.all(
    PERIODS.map(async period => {
      const startingDate = moment().subtract(getMilliseconds(period), 'milliseconds').toDate();
      const startSnapshot = await snapshotService.findFirstSince(player.id, startingDate);

      const currentDelta = await Delta.findOne({
        where: { playerId: player.id, period }
      });

      const newDelta = {
        playerId: player.id,
        period,
        startedAt: startSnapshot.createdAt,
        endedAt: latestSnapshot.createdAt
      };

      const periodDiffs = diff(startSnapshot, latestSnapshot, initialValues, player);

      ALL_METRICS.forEach(metric => {
        newDelta[metric] = periodDiffs[metric][getMeasure(metric)].gained;

        if (newDelta[metric] > currentDelta[metric]) {
          // if any metric has improved since the last delta sync, we should
          // also check for new records in this period
          currentDelta.isPotentialRecord = true;
        }
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

async function getPlayerTimeRangeDeltas(
  playerId: number,
  startDate: Date,
  endDate: Date,
  latest?: Snapshot,
  initial?: InitialValues,
  player?: Player
) {
  const initialValues = initial || (await InitialValues.findOne({ where: { playerId } }));
  const latestSnapshot = latest || (await snapshotService.findLatest(playerId, endDate));
  const targetPlayer = player || (await playerService.findById(playerId));

  const startSnapshot = await snapshotService.findFirstSince(playerId, startDate);

  if (!startSnapshot || !latestSnapshot) {
    return { startsAt: null, endsAt: null, data: emptyDiff() };
  }

  return {
    startsAt: startSnapshot.createdAt,
    endsAt: latestSnapshot.createdAt,
    data: diff(startSnapshot, latestSnapshot, initialValues, targetPlayer)
  };
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
  const [periodStr, durationMs] = parsePeriod(period);

  if (!periodStr) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  const startDate = new Date(Date.now() - durationMs);
  const endDate = new Date();

  const deltas = await getPlayerTimeRangeDeltas(playerId, startDate, endDate, latest, initial, player);

  return { period: periodStr, ...deltas };
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
  const { metric, period, playerBuild, playerType, country } = filter;
  const countryCode = country ? geoService.find(country)?.code : null;

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

  if (country && !countryCode) {
    throw new BadRequestError(
      `Invalid country. You must either supply a valid code or name, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    );
  }

  const query = buildQuery({ type: playerType, build: playerBuild, country: countryCode });
  const startingDate = moment().subtract(getMilliseconds(period), 'milliseconds').toDate();

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (query.type && query.type === 'ironman') {
    query.type = { [Op.or]: ['ironman', 'hardcore', 'ultimate'] };
  }

  const deltas = await Delta.findAll({
    attributes: [metric, 'startedAt', 'endedAt'],
    where: {
      period,
      updatedAt: { [Op.gte]: startingDate }
    },
    include: [{ model: Player, where: query }],
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
    where: { period, playerId: playerIds },
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

    const startRank = start[rankKey];
    const startValue = start[valueKey];

    // Any value below initialValue is invalid and should not be used
    // Except for skills since they can be imported from CML after initialValue has been set
    const isInvalidStartValue = startValue === -1 || (startValue < initialValue && !isSkill(metric));

    fixedStart[rankKey] = startRank === -1 && !isSkill(metric) ? initialRank : startRank;
    fixedStart[valueKey] = parseNum(metric, isInvalidStartValue ? initialValue : startValue);
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

    // Do not use initial ranks for skill, to prevent -1 ranks from creating crazy diffs
    // (introduced by https://github.com/wise-old-man/wise-old-man/pull/93)
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

    if (isSkill(metric)) {
      diffObj[metric]['ehp'] = { start: 0, end: 0, gained: 0 };
    } else if (isBoss(metric)) {
      diffObj[metric]['ehb'] = { start: 0, end: 0, gained: 0 };
    }
  });

  return diffObj;
}

export {
  getPlayerDeltas,
  getPlayerPeriodDeltas,
  getPlayerTimeRangeDeltas,
  getGroupLeaderboard,
  getLeaderboard,
  syncInitialValues,
  syncDeltas
};
