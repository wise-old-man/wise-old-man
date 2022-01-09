import { Op, Sequelize } from 'sequelize';
import {
  PlayerBuild,
  PlayerType,
  PLAYER_BUILDS,
  SKILLS,
  BOSSES,
  VIRTUAL_METRICS,
  getMetricValueKey,
  Metrics,
  round,
  findCountry
} from '@wise-old-man/utils';
import { Player, Snapshot } from '../../../database/models';
import { Pagination, VirtualAlgorithm } from '../../../types';
import { BadRequestError } from '../../errors';
import f2pAlgorithm from '../../modules/efficiency/algorithms/f2p';
import ironmanAlgorithm from '../../modules/efficiency/algorithms/ironman';
import lvl3Algorithm from '../../modules/efficiency/algorithms/lvl3';
import mainAlgorithm from '../../modules/efficiency/algorithms/main';
import { buildQuery } from '../../util/query';

interface PlayerVirtuals {
  ehpValue: number;
  ehpRank: number;
  ehbValue: number;
  ehbRank: number;
  ttm: number;
  tt200m: number;
}

export interface SnapshotVirtuals {
  [metric: string]: number;
}

interface LeaderboardFilter {
  metric: string;
  playerType: string;
  playerBuild?: string;
  country?: string;
}

async function getRates(metric = 'ehp', type = 'main') {
  switch (type) {
    case 'main':
      return metric === Metrics.EHP ? mainAlgorithm.getEHPRates() : mainAlgorithm.getEHBRates();
    case 'ironman':
      return metric === Metrics.EHP ? ironmanAlgorithm.getEHPRates() : ironmanAlgorithm.getEHBRates();
    case 'f2p':
      return metric === Metrics.EHP ? f2pAlgorithm.getEHPRates() : f2pAlgorithm.getEHBRates();
    case 'lvl3':
      return metric === Metrics.EHP ? lvl3Algorithm.getEHPRates() : lvl3Algorithm.getEHBRates();
    default:
      return metric === Metrics.EHP ? mainAlgorithm.getEHPRates() : mainAlgorithm.getEHBRates();
  }
}

async function getLeaderboard(filter: LeaderboardFilter, pagination: Pagination) {
  const { playerBuild, country } = filter;
  const countryCode = country ? findCountry(country)?.code : null;

  if (filter.metric && ![...VIRTUAL_METRICS, 'ehp+ehb'].includes(filter.metric)) {
    throw new BadRequestError('Invalid metric. Must be one of [ehp, ehb, ehp+ehb]');
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

  const metric = filter.metric || Metrics.EHP;
  const playerType = filter.playerType || PlayerType.REGULAR;

  const isCombined = metric === 'ehp+ehb';

  const query = buildQuery({ type: playerType, build: playerBuild, country: countryCode });

  // When filtering by player type, the ironman filter should include UIM and HCIM
  if (query.type && query.type === PlayerType.IRONMAN) {
    query.type = { [Op.or]: [PlayerType.IRONMAN, PlayerType.HARDCORE, PlayerType.ULTIMATE] };
  }

  const results = await Player.findAll({
    attributes: isCombined && { include: [['(ehp + ehb)', 'ehp+ehb']] },
    where: query,
    order: isCombined ? [[Sequelize.literal(metric), 'DESC']] : [[metric, 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  if (metric === Metrics.EHP && pagination.offset < 50 && playerType === PlayerType.REGULAR) {
    // This is a bit of an hack, to make sure the max ehp accounts always
    // retain their maxing order, manually set their registration dates to
    // ascend and use that to order them.
    return results.sort((a, b) => {
      return b.ehp - a.ehp || a.registeredAt.getTime() - b.registeredAt.getTime();
    });
  }

  return results;
}

/**
 * Calculates a player's overall virtual data (ttm, ehp, ehb, etc)
 */
async function calcPlayerVirtuals(player: Player, snapshot: Snapshot): Promise<PlayerVirtuals> {
  const { type, build } = player;

  const ttm = calculateTTM(snapshot, type, build);
  const tt200m = calculateTT200m(snapshot, type, build);

  const ehpValue = calculateEHP(snapshot, type, build);
  const ehbValue = calculateEHB(snapshot, type, build);

  const ehpRank = await getEHPRank(player, ehpValue);
  const ehbRank = await getEHBRank(player, ehbValue);

  return { ehpValue, ehpRank, ehbValue, ehbRank, ttm, tt200m };
}

/**
 * Calculates a player's ehp/ehb values for each metric.
 */
function calcSnapshotVirtuals(player: Player, snapshot: Snapshot): SnapshotVirtuals {
  const obj = {};
  const algorithm = getAlgorithm(player.type, player.build);

  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getMetricValueKey(s)]]));
  const kcs = Object.fromEntries(BOSSES.map(b => [b, snapshot[getMetricValueKey(b)]]));

  SKILLS.forEach(s => (obj[s] = round(algorithm.calculateSkillEHP(s, exp), 5)));
  BOSSES.forEach(b => (obj[b] = round(algorithm.calculateBossEHB(b, kcs), 5)));

  return obj;
}

function calculateTTM(snapshot: Snapshot, type = PlayerType.REGULAR, build = PlayerBuild.MAIN): number {
  const algorithm = getAlgorithm(type, build);
  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getMetricValueKey(s)]]));

  return Math.max(0, round(algorithm.calculateTTM(exp), 5));
}

function calculateTT200m(snapshot: Snapshot, type = PlayerType.REGULAR, build = PlayerBuild.MAIN): number {
  const algorithm = getAlgorithm(type, build);
  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getMetricValueKey(s)]]));

  return Math.max(0, round(algorithm.calculateTT200m(exp), 5));
}

function calculateEHP(snapshot: Snapshot, type = PlayerType.REGULAR, build = PlayerBuild.MAIN): number {
  const algorithm = getAlgorithm(type, build);
  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getMetricValueKey(s)]]));

  return round(algorithm.calculateEHP(exp), 5);
}

function calculateEHB(snapshot: Snapshot, type = PlayerType.REGULAR, build = PlayerBuild.MAIN) {
  const algorithm = getAlgorithm(type, build);
  const kcs = Object.fromEntries(BOSSES.map(b => [b, snapshot[getMetricValueKey(b)]]));

  return round(algorithm.calculateEHB(kcs), 5);
}

function calculateEHPDiff(beforeSnapshot: Snapshot, afterSnapshot: Snapshot): number {
  return calculateEHP(afterSnapshot) - calculateEHP(beforeSnapshot);
}

function calculateEHBDiff(beforeSnapshot: Snapshot, afterSnapshot: Snapshot): number {
  return calculateEHB(afterSnapshot) - calculateEHB(beforeSnapshot);
}

function getAlgorithm(type: string, build: string): VirtualAlgorithm {
  if (type === PlayerType.IRONMAN || type === PlayerType.HARDCORE || type === PlayerType.ULTIMATE) {
    return ironmanAlgorithm;
  }

  switch (build) {
    case 'f2p':
      return f2pAlgorithm;
    case 'lvl3':
      return lvl3Algorithm;
    default:
      return mainAlgorithm;
  }
}

async function getEHPRank(player: Player, ehpValue: number): Promise<number> {
  const rank = await Player.count({
    where: {
      id: { [Op.not]: player.id },
      ehp: { [Op.gte]: ehpValue },
      type: player.type
    }
  });

  // If player is not in the top 50, a quick COUNT(*) query gives an acceptable
  // rank approximation, this however won't work for players in the top of the
  // leaderboards, and we'll have to use their registration date as a tie breaker
  if (rank > 50) return rank + 1;

  const topPlayers = await Player.findAll({
    where: {
      ehp: { [Op.gte]: ehpValue },
      type: player.type
    }
  });

  const smarterRank = topPlayers
    .sort((a, b) => b.ehp - a.ehp || a.registeredAt.getTime() - b.registeredAt.getTime())
    .findIndex(p => p.id === player.id);

  return smarterRank < 0 ? rank + 1 : smarterRank + 1;
}

async function getEHBRank(player: Player, ehbValue: number): Promise<number> {
  const rank = await Player.count({
    where: {
      id: { [Op.not]: player.id },
      ehb: { [Op.gte]: ehbValue },
      type: player.type
    }
  });

  // If player is not in the top 50, a quick COUNT(*) query gives an acceptable
  // rank approximation, this however won't work for players in the top of the
  // leaderboards, and we'll have to use their registration date as a tie breaker
  if (rank > 50) return rank + 1;

  const topPlayers = await Player.findAll({
    where: {
      ehb: { [Op.gte]: ehbValue },
      type: player.type
    }
  });

  const smarterRank = topPlayers
    .sort((a, b) => b.ehb - a.ehb || a.registeredAt.getTime() - b.registeredAt.getTime())
    .findIndex(p => p.id === player.id);

  return smarterRank < 0 ? rank + 1 : smarterRank + 1;
}

export {
  getRates,
  getLeaderboard,
  calcPlayerVirtuals,
  calcSnapshotVirtuals,
  calculateTTM,
  calculateTT200m,
  calculateEHP,
  calculateEHB,
  calculateEHBDiff,
  calculateEHPDiff,
  getEHPRank,
  getEHBRank
};
