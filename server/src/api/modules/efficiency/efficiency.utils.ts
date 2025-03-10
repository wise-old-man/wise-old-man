import { Player, Snapshot } from '../../../prisma';
import {
  BOSSES,
  Boss,
  ComputedMetric,
  Metric,
  PlayerBuild,
  PlayerType,
  SKILLS,
  Skill,
  getMetricValueKey
} from '../../../utils';
import EfficiencyAlgorithm from './EfficiencyAlgorithm';
import mainBossingMetas from './configs/ehb/main.ehb';
import mainSkillingMetas from './configs/ehp/main.ehp';
import ironmanBossingMetas from './configs/ehb/ironman.ehb';
import ironmanSkillingMetas from './configs/ehp/ironman.ehp';
import lvl3SkillingMetas from './configs/ehp/lvl3.ehp';
import f2pSkillingMetas from './configs/ehp/f2p.ehp';
import f2pLvl3SkillingMetas from './configs/ehp/f2p_lvl3.ehp';
import f2pIronmanSkillingMetas from './configs/ehp/f2p_ironman.ehp';
import f2pLvl3IronmanSkillingMetas from './configs/ehp/f2p_lvl3_ironman.ehp';
import ultimateBossingMetas from './configs/ehb/ultimate.ehb';
import ultimateSkillingMetas from './configs/ehp/ultimate.ehp';
import def1BossingMetas from './configs/ehb/def1.ehb';
import def1SkillingMetas from './configs/ehp/def1.ehp';
import { EfficiencyAlgorithmType } from './efficiency.types';

export const ALGORITHMS = new Map<EfficiencyAlgorithmType, EfficiencyAlgorithm>(
  [
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.MAIN, mainSkillingMetas, mainBossingMetas),
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.IRONMAN, ironmanSkillingMetas, ironmanBossingMetas),
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.ULTIMATE, ultimateSkillingMetas, ultimateBossingMetas),
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.LVL3, lvl3SkillingMetas),
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.F2P, f2pSkillingMetas),
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.F2P_LVL3, f2pLvl3SkillingMetas),
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.F2P_IRONMAN, f2pIronmanSkillingMetas),
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.F2P_LVL3_IRONMAN, f2pLvl3IronmanSkillingMetas),
    new EfficiencyAlgorithm(EfficiencyAlgorithmType.DEF1, def1SkillingMetas, def1BossingMetas)
  ].map(a => [a.type, a])
);

export function getRates(metric: ComputedMetric, type: EfficiencyAlgorithmType) {
  // Wrong algorithm type
  if (!Object.values(EfficiencyAlgorithmType).includes(type)) return null;

  const algorithm = ALGORITHMS.get(type || EfficiencyAlgorithmType.MAIN);

  if (!algorithm) {
    throw new Error('Invalid algorithm type');
  }

  return metric === Metric.EHB ? algorithm.bossMetas : algorithm.skillMetas;
}

export function getAlgorithm(player?: Pick<Player, 'type' | 'build'>) {
  const algorithm = ALGORITHMS.get(getAlgorithmType(player));

  if (!algorithm) {
    throw new Error('Invalid algorithm type');
  }

  return algorithm;
}

export function getAlgorithmType(player?: Pick<Player, 'type' | 'build'>) {
  const { type = PlayerType.REGULAR, build = PlayerBuild.MAIN } = player || {};

  if (
    build === PlayerBuild.F2P &&
    (type === PlayerType.ULTIMATE || type === PlayerType.IRONMAN || type === PlayerType.HARDCORE)
  ) {
    return EfficiencyAlgorithmType.F2P_IRONMAN;
  }

  if (
    build === PlayerBuild.F2P_LVL3 &&
    (type === PlayerType.ULTIMATE || type === PlayerType.IRONMAN || type === PlayerType.HARDCORE)
  ) {
    return EfficiencyAlgorithmType.F2P_LVL3_IRONMAN;
  }

  if (type === PlayerType.ULTIMATE) {
    return EfficiencyAlgorithmType.ULTIMATE;
  }

  if (type === PlayerType.IRONMAN || type === PlayerType.HARDCORE) {
    return EfficiencyAlgorithmType.IRONMAN;
  }

  switch (build) {
    case PlayerBuild.F2P_LVL3:
      return EfficiencyAlgorithmType.F2P_LVL3;
    case PlayerBuild.F2P:
      return EfficiencyAlgorithmType.F2P;
    case PlayerBuild.LVL3:
      return EfficiencyAlgorithmType.LVL3;
    case PlayerBuild.DEF1:
      return EfficiencyAlgorithmType.DEF1;
    default:
      return EfficiencyAlgorithmType.MAIN;
  }
}

function getKillcountMap(snapshot: Snapshot) {
  return new Map<Boss, number>(BOSSES.map(b => [b, Math.max(0, snapshot[getMetricValueKey(b)])]));
}

function getExperienceMap(snapshot: Snapshot) {
  return new Map<Skill, number>(SKILLS.map(s => [s, Math.max(0, snapshot[getMetricValueKey(s)])]));
}

function getPlayerEHB(snapshot: Snapshot, player?: Pick<Player, 'type' | 'build'>) {
  return getAlgorithm(player).calculateEHB(getKillcountMap(snapshot));
}

function getPlayerEHP(snapshot: Snapshot, player?: Pick<Player, 'type' | 'build'>) {
  return getAlgorithm(player).calculateEHP(getExperienceMap(snapshot));
}

function getPlayerEfficiencyMap(snapshot: Snapshot, player: Pick<Player, 'type' | 'build'>) {
  const algorithm = getAlgorithm(player);

  return new Map([
    ...Array.from(algorithm.calculateEHPMap(getExperienceMap(snapshot)).entries()),
    ...Array.from(algorithm.calculateEHBMap(getKillcountMap(snapshot)).entries())
  ]);
}

export { getExperienceMap, getKillcountMap, getPlayerEHB, getPlayerEHP, getPlayerEfficiencyMap };
