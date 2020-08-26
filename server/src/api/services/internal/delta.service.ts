import { keyBy, mapValues } from 'lodash';
import moment from 'moment';
import { QueryTypes } from 'sequelize';
import { Pagination } from 'src/types';
import { sequelize } from '../../../database';
import { Delta, InitialValues, Player, Snapshot } from '../../../database/models';
import * as queries from '../../../database/queries';
import { ALL_METRICS, PERIODS, PLAYER_BUILDS, PLAYER_TYPES } from '../../constants';
import { BadRequestError } from '../../errors';
import { getPlayerPeriodDeltasLegacy, getSeconds } from '../../util/legacy';
import { getMeasure, getRankKey, getValueKey, isSkill } from '../../util/metrics';
import { buildQuery } from '../../util/query';
import * as snapshotService from './snapshot.service';

const DELTA_INDICATORS = ['value', 'rank', 'efficiency'];

async function syncDeltas(
  playerId: number,
  period: string,
  latest: Snapshot,
  initial: InitialValues
): Promise<void> {
  // prettier-ignore
  const startingDate = moment().subtract(getSeconds(period), "seconds").toDate();
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

    const endValue = parseInt(latest[valueKey]);
    const endRank = latest[rankKey];
    // TODO: const endEfficiency = ...

    const startValue = parseInt(first[valueKey] === -1 ? initialValue : first[valueKey]);
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
  if (toUpdate.length > 0) {
    await Promise.all(
      toUpdate.map(async ({ current, updated }) => {
        await current.update({ ...updated });
      })
    );
  }

  // Create all missing deltas
  if (toCreate.length > 0) {
    await Delta.bulkCreate(toCreate, { ignoreDuplicates: true });
  }
}

async function syncInitialValues(playerId: number, latest: Snapshot): Promise<InitialValues> {
  // Find or create (if doesn't exist) the player's initial values
  const [initial] = await InitialValues.findOrCreate({ where: { playerId } });

  mapValues(latest, (value, key) => {
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
async function getPlayerPeriodDeltas(playerId: number, period: string): Promise<PlayerPeriodDeltas> {
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
 * Gets the all the player deltas (gains), for every period.
 */
async function getPlayerDeltas(playerId: number): Promise<PlayerDeltas> {
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
 * Optionally, these deltas can be filtered by player type and build.
 */
async function getLeaderboard(
  metric: string,
  period: string,
  type?: string,
  build?: string
): Promise<LeaderboardEntry[]> {
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

  const deltas = await Delta.findAll({
    attributes: [metric, 'startedAt', 'endedAt'],
    where: { period, indicator: 'value' },
    order: [[metric, 'DESC']],
    include: [{ model: Player, where: buildQuery({ type, build }) }],
    limit: 20
  });

  return deltas.map(d => ({
    startDate: d.startedAt,
    endDate: d.endedAt,
    gained: parseInt(d[metric]),
    player: d.player
  }));
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
    endValue: parseInt(r.endValue),
    startValue: parseInt(r.startValue),
    gained: parseInt(r.gained)
  }));
}

/**
 * Gets the best deltas for a specific metric, period and list of players.
 * Note: this is useful for group statistics
 */
async function getGroupLeaderboard(
  metric: string,
  period: string,
  ids: number[],
  pagination: Pagination
): Promise<LeaderboardEntry[]> {
  // Fetch all deltas for group members
  const deltas = await Delta.findAll({
    attributes: [metric, 'startedAt', 'endedAt'],
    where: { period, indicator: 'value', playerId: ids },
    order: [[metric, 'DESC']],
    include: [{ model: Player }],
    limit: pagination.limit,
    offset: pagination.offset
  });

  return deltas.map(d => ({
    startDate: d.startedAt,
    endDate: d.endedAt,
    gained: parseInt(d[metric]),
    player: d.player
  }));
}

interface LeaderboardEntry {
  startDate: Date;
  endDate: Date;
  gained: number;
  player: Player;
}

interface PlayerDeltas {
  [period: string]: PlayerPeriodDeltas;
}

interface PlayerPeriodDeltas {
  period: string;
  startsAt: Date;
  endsAt: Date;
  data: {
    [metric: string]: {
      rank: {
        start: number;
        end: number;
        gained: number;
      };
      [measure: string]: {
        start: number;
        end: number;
        gained: number;
      };
    };
  };
}

export {
  getPlayerDeltas,
  getPlayerPeriodDeltas,
  getGroupLeaderboard,
  getLeaderboard,
  getCompetitionLeaderboard,
  syncInitialValues,
  syncDeltas
};
