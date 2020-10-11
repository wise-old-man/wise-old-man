import { Op, Sequelize } from 'sequelize';
import { Player, Snapshot } from '../../../database/models';
import { Pagination, VirtualAlgorithm } from '../../../types';
import { BOSSES, PLAYER_BUILDS, SKILLS, VIRTUAL } from '../../constants';
import { BadRequestError } from '../../errors';
import f2pAlgorithm from '../../modules/efficiency/algorithms/f2p';
import ironmanAlgorithm from '../../modules/efficiency/algorithms/ironman';
import {
  default as lvl3Algorithm,
  default as mainAlgorithm
} from '../../modules/efficiency/algorithms/main';
import { getValueKey } from '../../util/metrics';
import { round } from '../../util/numbers';
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
}

async function getRates(metric = 'ehp', type = 'main') {
  const isEHP = metric === 'ehp';

  switch (type) {
    case 'main':
      return isEHP ? mainAlgorithm.getEHPRates() : mainAlgorithm.getEHBRates();
    case 'ironman':
      return isEHP ? ironmanAlgorithm.getEHPRates() : ironmanAlgorithm.getEHBRates();
    case 'f2p':
      return isEHP ? f2pAlgorithm.getEHPRates() : f2pAlgorithm.getEHBRates();
    case 'lvl3':
      return isEHP ? lvl3Algorithm.getEHPRates() : lvl3Algorithm.getEHBRates();
    default:
      return isEHP ? mainAlgorithm.getEHPRates() : mainAlgorithm.getEHBRates();
  }
}

async function getLeaderboard(filter: LeaderboardFilter, pagination: Pagination) {
  if (filter.metric && ![...VIRTUAL, 'ehp+ehb'].includes(filter.metric)) {
    throw new BadRequestError('Invalid metric. Must be one of [ehp, ehb, ehp+ehb]');
  }

  if (filter.playerBuild && !PLAYER_BUILDS.includes(filter.playerBuild)) {
    throw new BadRequestError(`Invalid player build: ${filter.playerBuild}.`);
  }

  const metric = filter.metric || 'ehp';
  const playerType = filter.playerType || 'regular';

  const isCombined = metric === 'ehp+ehb';

  const results = await Player.findAll({
    attributes: isCombined && { include: [['(ehp + ehb)', 'ehp+ehb']] },
    where: buildQuery({ type: playerType, build: filter.playerBuild }),
    order: isCombined ? [[Sequelize.literal(metric), 'DESC']] : [[metric, 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  if (metric === 'ehp' && pagination.offset < 20 && playerType === 'regular') {
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

  const ehpRank = await getEHPRank(player.id, ehpValue);
  const ehbRank = await getEHBRank(player.id, ehbValue);

  return { ehpValue, ehpRank, ehbValue, ehbRank, ttm, tt200m };
}

/**
 * Calculates a player's ehp/ehb values for each metric.
 */
function calcSnapshotVirtuals(player: Player, snapshot: Snapshot): SnapshotVirtuals {
  const obj = {};
  const algorithm = getAlgorithm(player.type, player.build);

  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getValueKey(s)]]));
  const kcs = Object.fromEntries(BOSSES.map(b => [b, snapshot[getValueKey(b)]]));

  SKILLS.forEach(s => (obj[s] = round(algorithm.calculateSkillEHP(s, exp), 5)));
  BOSSES.forEach(b => (obj[b] = round(algorithm.calculateBossEHB(b, kcs), 5)));

  return obj;
}

function calculateTTM(snapshot: Snapshot, type = 'regular', build = 'main'): number {
  const algorithm = getAlgorithm(type, build);
  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getValueKey(s)]]));

  return Math.max(0, round(algorithm.calculateTTM(exp), 5));
}

function calculateTT200m(snapshot: Snapshot, type = 'regular', build = 'main'): number {
  const algorithm = getAlgorithm(type, build);
  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getValueKey(s)]]));

  return Math.max(0, round(algorithm.calculateTT200m(exp), 5));
}

function calculateEHP(snapshot: Snapshot, type = 'regular', build = 'main'): number {
  const algorithm = getAlgorithm(type, build);
  const exp = Object.fromEntries(SKILLS.map(s => [s, snapshot[getValueKey(s)]]));

  return round(algorithm.calculateEHP(exp), 5);
}

function calculateEHB(snapshot: Snapshot, type = 'regular', build = 'main') {
  const algorithm = getAlgorithm(type, build);
  const kcs = Object.fromEntries(BOSSES.map(b => [b, snapshot[getValueKey(b)]]));

  return round(algorithm.calculateEHB(kcs), 5);
}

function calculateEHPDiff(beforeSnapshot: Snapshot, afterSnapshot: Snapshot): number {
  return calculateEHP(afterSnapshot) - calculateEHP(beforeSnapshot);
}

function calculateEHBDiff(beforeSnapshot: Snapshot, afterSnapshot: Snapshot): number {
  return calculateEHB(afterSnapshot) - calculateEHB(beforeSnapshot);
}

function getAlgorithm(type: string, build: string): VirtualAlgorithm {
  if (type === 'ironman' || type === 'hardcore' || type === 'ultimate') {
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

async function getEHPRank(playerId: number, ehpValue: number): Promise<number> {
  const rank = await Player.count({
    where: {
      id: { [Op.not]: playerId },
      ehp: { [Op.gte]: ehpValue }
    }
  });

  return rank + 1;
}

async function getEHBRank(playerId: number, ehbValue: number): Promise<number> {
  const rank = await Player.count({
    where: {
      id: { [Op.not]: playerId },
      ehb: { [Op.gte]: ehbValue }
    }
  });

  return rank + 1;
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
