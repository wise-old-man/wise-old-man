import { keyBy, mapValues } from 'lodash';
import moment from 'moment';
import { Op } from 'sequelize';
import {
  METRICS,
  PERIODS,
  PLAYER_TYPES,
  PLAYER_BUILDS,
  isValidPeriod,
  parsePeriodExpression,
  PlayerType,
  PlayerBuild,
  PeriodProps,
  Metric,
  getMetricValueKey,
  getMetricRankKey,
  getMetricMeasure,
  getMinimumBossKc,
  isSkill,
  isBoss,
  isVirtualMetric,
  Metrics,
  round,
  findCountry
} from '@wise-old-man/utils';
import { Delta, Player, Snapshot } from '../../../database/models';
import { Pagination } from '../../../types';
import { BadRequestError } from '../../errors';
import { buildQuery } from '../../util/query';
import * as efficiencyService from './efficiency.service';
import * as playerService from './player.service';
import * as snapshotService from './snapshot.service';
import * as snapshotServices from '../../modules/snapshots/snapshot.services';

interface GlobalDeltasFilter {
  period?: string;
  metric?: string;
  playerType?: string;
  playerBuild?: string;
  country?: string;
}

function parseNum(metric: string, val: string) {
  return isVirtualMetric(metric as Metric) ? parseFloat(val) : parseInt(val);
}

async function syncDeltas(player: Player, latestSnapshot: Snapshot) {
  await Promise.all(
    PERIODS.map(async period => {
      const startSnapshot = await snapshotServices.findPlayerSnapshot({
        id: player.id,
        minDate: moment().subtract(PeriodProps[period].milliseconds, 'milliseconds').toDate()
      });

      const currentDelta = await Delta.findOne({
        where: { playerId: player.id, period }
      });

      const newDelta = {
        playerId: player.id,
        period,
        startedAt: startSnapshot.createdAt,
        endedAt: latestSnapshot.createdAt
      };

      const periodDiffs = calculateDiff(startSnapshot as any, latestSnapshot, player);

      METRICS.forEach(metric => {
        newDelta[metric] = periodDiffs[metric][getMetricMeasure(metric)].gained;

        if (currentDelta && newDelta[metric] > currentDelta[metric]) {
          // if any metric has improved since the last delta sync, we should
          // also check for new records in this period
          currentDelta.isPotentialRecord = true;
        }
      });

      // If player doesn't have a delta for this period
      // on the database, create it, otherwise just update it
      if (!currentDelta) {
        await Delta.create({ ...newDelta, isPotentialRecord: true });
      } else {
        await currentDelta.update({ ...newDelta });
      }
    })
  );
}

async function getPlayerTimeRangeDeltas(
  playerId: number,
  startDate: Date,
  endDate: Date,
  latest?: Snapshot,
  player?: Player
) {
  const latestSnapshot =
    latest || (await snapshotServices.findPlayerSnapshot({ id: playerId, maxDate: endDate }));

  const targetPlayer = player || (await playerService.findById(playerId));
  const startSnapshot = await snapshotServices.findPlayerSnapshot({ id: playerId, minDate: startDate });

  if (!startSnapshot || !latestSnapshot) {
    return { startsAt: null, endsAt: null, data: emptyDiff() };
  }

  return {
    startsAt: startSnapshot.createdAt,
    endsAt: latestSnapshot.createdAt,
    data: calculateDiff(startSnapshot as any, latestSnapshot as any, targetPlayer)
  };
}

/**
 * Get all the player deltas (gains) for a specific time period.
 */
async function getPlayerPeriodDeltas(playerId: number, period: string, latest?: Snapshot, player?: Player) {
  const parsedPeriod = parsePeriodExpression(period);

  if (!parsedPeriod) throw new BadRequestError(`Invalid period: ${period}.`);

  const startDate = new Date(Date.now() - parsedPeriod.durationMs);
  const endDate = new Date();

  const deltas = await getPlayerTimeRangeDeltas(playerId, startDate, endDate, latest, player);

  return { period: parsedPeriod.expression, ...deltas };
}

/**
 * Gets the all the player deltas (gains), for every period.
 */
async function getPlayerDeltas(playerId: number) {
  const latest = await snapshotServices.findPlayerSnapshot({ id: playerId });

  const player = await playerService.findById(playerId);

  const periodDeltas = await Promise.all(
    PERIODS.map(async period => {
      const deltas = await getPlayerPeriodDeltas(playerId, period, latest as any, player);
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
  const countryCode = country ? findCountry(country)?.code : null;

  if (!period || !isValidPeriod(period)) {
    throw new BadRequestError(`Invalid period: ${period}.`);
  }

  if (!metric || !METRICS.includes(metric as Metric)) {
    throw new BadRequestError(`Invalid metric: ${metric}.`);
  }

  if (playerType && !PLAYER_TYPES.includes(playerType as PlayerType)) {
    throw new BadRequestError(`Invalid player type: ${playerType}.`);
  }

  if (playerBuild && !PLAYER_BUILDS.includes(playerBuild as PlayerBuild)) {
    throw new BadRequestError(`Invalid player build: ${playerBuild}.`);
  }

  if (country && !countryCode) {
    throw new BadRequestError(
      `Invalid country. You must either supply a valid code or name, according to the ISO 3166-1 standard. \
      Please see: https://en.wikipedia.org/wiki/ISO_3166-1_alpha-2`
    );
  }

  const query = buildQuery({ type: playerType, build: playerBuild, country: countryCode });
  const startingDate = moment().subtract(PeriodProps[period].milliseconds, 'milliseconds').toDate();

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (query.type && query.type === PlayerType.IRONMAN) {
    query.type = { [Op.or]: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
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

async function getGroupPeriodDeltas(
  metric: string,
  period: string,
  playerIds: number[],
  pagination: Pagination
) {
  const parsedPeriod = parsePeriodExpression(period);

  if (!parsedPeriod) throw new BadRequestError(`Invalid period: ${period}.`);

  const deltas = await getGroupTimeRangeDeltas(
    metric as Metric,
    new Date(Date.now() - parsedPeriod.durationMs),
    new Date(),
    playerIds,
    pagination
  );

  return deltas;
}

async function getGroupTimeRangeDeltas(
  metric: Metric,
  startDate: Date,
  endDate: Date,
  playerIds: number[],
  pagination: Pagination
) {
  // Calculated metrics (virtuals) require all columns to be fetched from the db
  const attributes = isVirtualMetric(metric) ? '*' : `"${getMetricValueKey(metric)}"`;

  const [players, lastSnapshots, firstSnapshots] = await Promise.all([
    playerService.findAllByIds(playerIds),
    snapshotService.getGroupLastSnapshots(playerIds, endDate, attributes),
    snapshotService.getGroupFirstSnapshots(playerIds, startDate, attributes)
  ]);

  const playerMap = Object.fromEntries(
    playerIds.map(id => [id, { player: null, startSnapshot: null, endSnapshot: null }])
  );

  players.forEach(p => {
    if (p.id in playerMap) playerMap[p.id].player = p;
  });

  firstSnapshots.forEach(f => {
    if (f.playerId in playerMap) playerMap[f.playerId].startSnapshot = f;
  });

  lastSnapshots.forEach(l => {
    if (l.playerId in playerMap) playerMap[l.playerId].endSnapshot = l;
  });

  const results = Object.keys(playerMap)
    .map(playerId => {
      const { player, startSnapshot, endSnapshot } = playerMap[playerId];
      if (!player || !startSnapshot || !endSnapshot) return null;

      return {
        startDate: startSnapshot.createdAt,
        endDate: endSnapshot.createdAt,
        ...calculateMetricDiff(player, startSnapshot, endSnapshot, metric),
        player
      };
    })
    .filter(r => r !== null)
    .sort((a, b) => b.gained - a.gained)
    .slice(pagination.offset, pagination.offset + pagination.limit);

  return results;
}

function calculateMetricDiff(player: Player, startSnapshot: Snapshot, endSnapshot: Snapshot, metric: Metric) {
  if (metric === Metrics.EHP) {
    const { type, build } = player;
    const start = startSnapshot ? efficiencyService.calculateEHP(startSnapshot, type, build) : -1;
    const end = endSnapshot ? efficiencyService.calculateEHP(endSnapshot, type, build) : -1;

    return { start, end, gained: Math.max(0, round(end - start, 5)) };
  }

  if (metric === Metrics.EHB) {
    const { type, build } = player;
    const start = startSnapshot ? efficiencyService.calculateEHB(startSnapshot, type, build) : -1;
    const end = endSnapshot ? efficiencyService.calculateEHB(endSnapshot, type, build) : -1;

    return { start, end, gained: Math.max(0, round(end - start, 5)) };
  }

  const minimumValue = getMinimumBossKc(metric);
  const metricKey = getMetricValueKey(metric);
  const start = startSnapshot ? parseNum(metric, startSnapshot[metricKey]) : -1;
  const end = endSnapshot ? parseNum(metric, endSnapshot[metricKey]) : -1;

  return { start, end, gained: Math.max(0, end - Math.max(minimumValue - 1, start)) };
}

/**
 * Calculate the difference between two snapshots,
 * taking untracked values into consideration.
 */
function calculateDiff(startSnapshot: Snapshot, endSnapshot: Snapshot, player: Player) {
  const diffObj = {};

  const startEfficiencyMap = efficiencyService.calcSnapshotVirtuals(player, startSnapshot);
  const endEfficiencyMap = efficiencyService.calcSnapshotVirtuals(player, endSnapshot);

  const startEHP = efficiencyService.calculateEHP(startSnapshot, player.type, player.build);
  const startEHB = efficiencyService.calculateEHB(startSnapshot, player.type, player.build);

  const endEHP = efficiencyService.calculateEHP(endSnapshot, player.type, player.build);
  const endEHB = efficiencyService.calculateEHB(endSnapshot, player.type, player.build);

  METRICS.forEach(metric => {
    const rankKey = getMetricRankKey(metric);
    const valueKey = getMetricValueKey(metric);
    const minimumValue = getMinimumBossKc(metric);

    const startRank = startSnapshot[rankKey] || -1;
    const startValue = parseNum(metric, startSnapshot[valueKey] || -1);

    const endRank = endSnapshot[rankKey] || -1;
    const endValue = parseNum(metric, endSnapshot[valueKey] || -1);

    // Do not use initial ranks for skill, to prevent -1 ranks from creating crazy diffs
    // (introduced by https://github.com/wise-old-man/wise-old-man/pull/93)
    const gainedRank =
      isSkill(metric) && startSnapshot[rankKey] === -1 ? 0 : endRank - Math.max(0, startRank);

    let gainedValue = round(Math.max(0, endValue - Math.max(0, minimumValue - 1, startValue)), 5);

    // Some players with low total level (but high exp) can sometimes fall off the hiscores
    // causing their starting exp to be -1, this would then cause the diff to think
    // that their entire ranked exp has just been gained (by jumping from -1 to 40m, for example)
    if (metric === Metrics.OVERALL && startValue === -1) gainedValue = 0;

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
      [getMetricMeasure(metric)]: {
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

  diffObj[Metrics.EHP].value = {
    start: startEHP,
    end: endEHP,
    gained: round(endEHP - startEHP, 5)
  };

  diffObj[Metrics.EHB].value = {
    start: startEHB,
    end: endEHB,
    gained: round(endEHB - startEHB, 5)
  };

  // Set overall EHP, since the overall EHP is the total EHP
  diffObj[Metrics.OVERALL].ehp = {
    ...diffObj[Metrics.EHP].value
  };

  return diffObj;
}

function emptyDiff() {
  const diffObj = {};

  METRICS.forEach(metric => {
    diffObj[metric] = {
      rank: { start: 0, end: 0, gained: 0 },
      [getMetricMeasure(metric)]: { start: 0, end: 0, gained: 0 }
    };

    if (isSkill(metric)) {
      diffObj[metric][Metrics.EHP] = { start: 0, end: 0, gained: 0 };
    } else if (isBoss(metric)) {
      diffObj[metric][Metrics.EHB] = { start: 0, end: 0, gained: 0 };
    }
  });

  return diffObj;
}

export {
  getPlayerDeltas,
  getPlayerPeriodDeltas,
  getPlayerTimeRangeDeltas,
  getGroupPeriodDeltas,
  getGroupTimeRangeDeltas,
  getLeaderboard,
  calculateMetricDiff,
  syncDeltas
};
