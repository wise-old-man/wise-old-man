import { mapValues } from 'lodash';
import { Player, Snapshot } from '../../../prisma';
import {
  round,
  SKILLS,
  BOSSES,
  Skill,
  Boss,
  ComputedMetric,
  Metric,
  getMetricValueKey,
  PlayerType,
  PlayerBuild,
  MAX_SKILL_EXP,
  SKILL_EXP_AT_99
} from '../../../utils';
import {
  AlgorithmCache,
  Bonus,
  BonusType,
  BossMetaConfig,
  EfficiencyAlgorithm,
  EfficiencyAlgorithmType,
  EfficiencyMap,
  ExperienceMap,
  KillcountMap,
  SkillMetaConfig
} from './efficiency.types';
import mainBossingMetas from './configs/ehb/main.ehb';
import mainSkillingMetas from './configs/ehp/main.ehp';
import ironmanBossingMetas from './configs/ehb/ironman.ehb';
import ironmanSkillingMetas from './configs/ehp/ironman.ehp';
import lvl3SkillingMetas from './configs/ehp/lvl3.ehp';
import f2pSkillingMetas from './configs/ehp/f2p.ehp';
import ultimateSkillingMetas from './configs/ehp/ultimate.ehp';

export const ALGORITHMS: AlgorithmCache = {
  [EfficiencyAlgorithmType.MAIN]: buildAlgorithmCache(mainSkillingMetas, mainBossingMetas),
  [EfficiencyAlgorithmType.IRONMAN]: buildAlgorithmCache(ironmanSkillingMetas, ironmanBossingMetas),
  [EfficiencyAlgorithmType.ULTIMATE]: buildAlgorithmCache(ultimateSkillingMetas, ironmanBossingMetas),
  [EfficiencyAlgorithmType.LVL3]: buildAlgorithmCache(lvl3SkillingMetas),
  [EfficiencyAlgorithmType.F2P]: buildAlgorithmCache(f2pSkillingMetas)
};

/**
 * Builds a cache of the EHP/EHB algorithms for each player type and build.
 */
export function buildAlgorithmCache(skillMetas: SkillMetaConfig[], bossMetas: BossMetaConfig[] = []) {
  const maxedEHP = calculateMaxedEHP(skillMetas);
  const maximumEHP = calculateMaximumEHP(skillMetas);

  function _calculateTT200m(experienceMap: ExperienceMap) {
    return calculateTT200m(experienceMap, skillMetas);
  }

  function _calculateEHP(experienceMap: ExperienceMap) {
    return maximumEHP - _calculateTT200m(experienceMap);
  }

  function _calculateEHB(killcountMap: KillcountMap) {
    return calculateEHB(killcountMap, bossMetas);
  }

  function _calculateTTM(experienceMap: ExperienceMap) {
    const cappedExp = mapValues(experienceMap, val => Math.min(val, SKILL_EXP_AT_99));
    return maxedEHP - _calculateEHP(cappedExp);
  }

  function _calculateSkillEHP(skill: Skill, experienceMap: ExperienceMap) {
    if (skill === Skill.OVERALL) return _calculateEHP(experienceMap);
    return _calculateTT200m({ ...experienceMap, [skill]: 0 }) - _calculateTT200m(experienceMap);
  }

  function _calculateBossEHB(boss: Boss, killcountMap: KillcountMap) {
    return calculateBossEHB(boss, killcountMap[boss], bossMetas);
  }

  return {
    maxedEHP,
    maximumEHP,
    skillMetas,
    bossMetas,
    calculateTT200m: _calculateTT200m,
    calculateTTM: _calculateTTM,
    calculateEHP: _calculateEHP,
    calculateEHB: _calculateEHB,
    calculateSkillEHP: _calculateSkillEHP,
    calculateBossEHB: _calculateBossEHB
  };
}

export function getRates(metric: ComputedMetric, type: EfficiencyAlgorithmType) {
  // Wrong algorithm type
  if (!Object.values(EfficiencyAlgorithmType).includes(type)) return null;

  const algorithm = ALGORITHMS[type || 'main'];
  return metric === Metric.EHB ? algorithm.bossMetas : algorithm.skillMetas;
}

export function getAlgorithm(player?: Pick<Player, 'type' | 'build'>): EfficiencyAlgorithm {
  const { type = PlayerType.REGULAR, build = PlayerBuild.MAIN } = player || {};

  if (type === PlayerType.ULTIMATE) {
    return ALGORITHMS[EfficiencyAlgorithmType.ULTIMATE];
  }

  if (type === PlayerType.IRONMAN || type === PlayerType.HARDCORE) {
    return ALGORITHMS[EfficiencyAlgorithmType.IRONMAN];
  }

  switch (build) {
    case PlayerBuild.F2P:
      return ALGORITHMS[EfficiencyAlgorithmType.F2P];
    case PlayerBuild.LVL3:
      return ALGORITHMS[EfficiencyAlgorithmType.LVL3];
    default:
      return ALGORITHMS[EfficiencyAlgorithmType.MAIN];
  }
}

function getBonuses(metas: SkillMetaConfig[], type: BonusType): Bonus[] {
  return metas
    .filter(r => r.bonuses.length > 0)
    .map(r => r.bonuses)
    .flat()
    .filter(b => b?.end === (type === BonusType.END));
}

function calculateBonuses(experienceMap: ExperienceMap, bonuses: Bonus[]) {
  // Creates an object with an entry for each bonus skill (0 bonus exp)
  const map = Object.fromEntries(bonuses.map(b => [b.bonusSkill, 0]));

  bonuses.forEach(b => {
    const bonusCap = b.maxBonus || MAX_SKILL_EXP;
    const expCap = Math.min(b.endExp, MAX_SKILL_EXP);
    const start = Math.max(experienceMap[b.originSkill], b.startExp);
    const target = b.originSkill in map ? expCap - map[b.originSkill] : expCap;

    map[b.bonusSkill] = Math.min(bonusCap, map[b.bonusSkill] + Math.max(0, target - start) * b.ratio);
  });

  return map;
}

function calculateMaximumEHP(metas: SkillMetaConfig[]) {
  const zeroStats = Object.fromEntries(SKILLS.map(s => [s, 0])) as ExperienceMap;

  return calculateTT200m(zeroStats, metas);
}

function calculateMaxedEHP(metas: SkillMetaConfig[]) {
  const zeroStats = Object.fromEntries(SKILLS.map(s => [s, 0])) as ExperienceMap;
  const maxedStats = Object.fromEntries(SKILLS.map(s => [s, SKILL_EXP_AT_99])) as ExperienceMap;

  return calculateTT200m(zeroStats, metas) - calculateTT200m(maxedStats, metas);
}

function calculateBossEHB(boss: Boss, killcount: number, metas: BossMetaConfig[]) {
  if (!killcount || killcount <= 0) return 0;

  const meta = metas.find(meta => meta.boss === boss);
  if (!meta || meta.rate <= 0) return 0;

  return round(killcount / meta.rate, 5);
}

function calculateEHB(killcountMap: KillcountMap, metas: BossMetaConfig[]) {
  return BOSSES.map(b => calculateBossEHB(b, killcountMap[b], metas)).reduce((a, c) => a + c);
}

function calculateTT200m(experienceMap: ExperienceMap, metas: SkillMetaConfig[]): number {
  // Ensure unranked skills (-1) are treated as 0 exp
  const fixedMap = mapValues(experienceMap, exp => Math.max(0, exp));

  const startBonusExp = calculateBonuses(fixedMap, getBonuses(metas, BonusType.START));
  const endBonusExp = calculateBonuses(fixedMap, getBonuses(metas, BonusType.END));

  const startExps = Object.fromEntries(SKILLS.map(s => [s, fixedMap[s] + (startBonusExp[s] || 0)]));

  const targetExps = Object.fromEntries(
    SKILLS.map(s => [s, s in endBonusExp ? MAX_SKILL_EXP - endBonusExp[s] : MAX_SKILL_EXP])
  );

  const skillTimes = SKILLS.map(skill => {
    if (skill === Metric.OVERALL) return 0;

    const methods = metas.find(sm => sm.skill === skill)?.methods;
    const startExp = startExps[skill];
    const endExp = targetExps[skill];

    // Handle 0 time skills (Hitpoints, Magic, Fletching)
    if (!methods || (methods.length === 1 && methods[0].rate === 0)) {
      return (endExp - startExp) / MAX_SKILL_EXP;
    }

    let skillTime = 0;

    for (let i = 0; i < methods.length; i++) {
      const current = methods[i];
      const next = methods[i + 1];

      if (current.rate === 0) continue;

      // Start exp is within this method's boundaries
      if (next && next.startExp > startExp && current.startExp < endExp) {
        const gained = Math.min(next.startExp, endExp) - Math.max(startExp, current.startExp);
        skillTime += Math.max(0, gained / current.rate);
      }

      // End exp is beyond this method's boundaries
      if (!next && endExp > current.startExp) {
        const gained = endExp - Math.max(current.startExp, startExp);
        skillTime += Math.max(0, gained / current.rate);
      }
    }

    return skillTime;
  });

  // Sum all inidividual skill times, into the total TTM
  return round(
    skillTimes.reduce((a, c) => a + c),
    5
  );
}

function getKillcountMap(snapshot: Snapshot): KillcountMap {
  return Object.fromEntries(BOSSES.map(b => [b, snapshot[getMetricValueKey(b)]])) as KillcountMap;
}

function getExperienceMap(snapshot: Snapshot): ExperienceMap {
  return Object.fromEntries(SKILLS.map(s => [s, snapshot[getMetricValueKey(s)]])) as ExperienceMap;
}

function getPlayerEHB(snapshot: Snapshot, player?: Pick<Player, 'type' | 'build'>) {
  const algorithm = getAlgorithm(player);
  return algorithm.calculateEHB(getKillcountMap(snapshot));
}

function getPlayerEHP(snapshot: Snapshot, player?: Pick<Player, 'type' | 'build'>) {
  const algorithm = getAlgorithm(player);
  return algorithm.calculateEHP(getExperienceMap(snapshot));
}

function getPlayerEfficiencyMap(snapshot: Snapshot, player: Pick<Player, 'type' | 'build'>): EfficiencyMap {
  if (!snapshot) return null;

  const algorithm = getAlgorithm(player);

  const expMap = getExperienceMap(snapshot);
  const kcMap = getKillcountMap(snapshot);

  return {
    ...(Object.fromEntries(SKILLS.map(s => [s, algorithm.calculateSkillEHP(s, expMap)])) as ExperienceMap),
    ...(Object.fromEntries(BOSSES.map(b => [b, algorithm.calculateBossEHB(b, kcMap)])) as KillcountMap)
  };
}

export { getPlayerEHB, getPlayerEHP, getPlayerEfficiencyMap, getKillcountMap, getExperienceMap };
