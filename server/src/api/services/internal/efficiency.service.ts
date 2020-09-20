import { Op } from 'sequelize';
import { Player, Snapshot } from '../../../database/models';
import { BOSSES, SKILLS } from '../../constants';
import {
  default as f2pAlgorithm,
  default as ironAlgorithm,
  default as lvl3Algorithm,
  default as mainAlgorithm
} from '../../modules/efficiency/algorithms/main';
import { getValueKey } from '../../util/metrics';
import { round } from '../../util/numbers';

function getAlgorithm(type: string, build: string) {
  if (type === 'ironman' || type === 'hardcore' || type === 'ultimate') {
    return ironAlgorithm;
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

async function calculateEfficiency(player: Player, snapshot: Snapshot) {
  const { type, build } = player;

  const ttm = calculateTTM(snapshot, type, build);
  const tt200m = calculateTT200m(snapshot, type, build);

  const ehpValue = calculateEHP(snapshot, type, build);
  const ehbValue = calculateEHB(snapshot, type, build);

  const ehpRank = await getEHPRank(player.id, ehpValue);
  const ehbRank = await getEHBRank(player.id, ehbValue);

  return { ehpValue, ehpRank, ehbValue, ehbRank, ttm, tt200m };
}

async function calculateDetailedEfficiency(player: Player, snapshot: Snapshot) {
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
  calculateEfficiency,
  calculateDetailedEfficiency,
  calculateTTM,
  calculateTT200m,
  calculateEHP,
  calculateEHB,
  calculateEHBDiff,
  calculateEHPDiff,
  getEHPRank,
  getEHBRank
};
