import { MAX_SKILL_EXP, SKILL_EXP_AT_99, PlayerType } from '@wise-old-man/utils';
import { mapValues } from 'lodash';
import { BossEnum, Bosses, MetricEnum, SkillEnum, Skills } from '../../../prisma';
import {
  AlgorithmCache,
  Bonus,
  BonusType,
  BossMetaConfig,
  EfficiencyAlgorithm,
  EfficiencyAlgorithmType,
  ExperienceMap,
  KillcountMap,
  SkillMetaConfig
} from './efficiency.types';
import mainBossingMetas from './configs/ehb/main.ehb';
import mainSkillingMetas from './configs/ehp/main.ehp';
import ironmanBossingMetas from './configs/ehb/ironman.ehb';
import ironmanSkillingMetas from './configs/ehp/ironman.ehp';
import lvl3BossingMetas from './configs/ehb/lvl3.ehb';
import lvl3SkillingMetas from './configs/ehp/lvl3.ehp';
import f2pBossingMetas from './configs/ehb/f2p.ehb';
import f2pSkillingMetas from './configs/ehp/f2p.ehp';

export const ALGORITHMS: AlgorithmCache = {
  [EfficiencyAlgorithmType.MAIN]: buildAlgorithCache(mainSkillingMetas, mainBossingMetas),
  [EfficiencyAlgorithmType.IRONMAN]: buildAlgorithCache(ironmanSkillingMetas, ironmanBossingMetas),
  [EfficiencyAlgorithmType.LVL3]: buildAlgorithCache(lvl3SkillingMetas, lvl3BossingMetas),
  [EfficiencyAlgorithmType.F2P]: buildAlgorithCache(f2pSkillingMetas, f2pBossingMetas)
};

/**
 * Builds a cache of the EHP/EHB algorithms for each player type and build.
 */
export function buildAlgorithCache(skillMetas: SkillMetaConfig[], bossMetas: BossMetaConfig[]) {
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

  function _calculateSkillEHP(skill: SkillEnum, experienceMap: ExperienceMap) {
    return _calculateTT200m({ ...experienceMap, [skill]: 0 }) - _calculateTT200m(experienceMap);
  }

  function _calculateBossEHB(boss: BossEnum, killcountMap: KillcountMap) {
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

// TODO: refactor to using enums
export function getAlgorithm(type: string, build: string): EfficiencyAlgorithm {
  if (type === PlayerType.IRONMAN || type === PlayerType.HARDCORE || type === PlayerType.ULTIMATE) {
    return ALGORITHMS.ironman;
  }

  switch (build) {
    case 'f2p':
      return ALGORITHMS.f2p;
    case 'lvl3':
      return ALGORITHMS.lvl3;
    default:
      return ALGORITHMS.main;
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
  const zeroStats = Object.fromEntries(Skills.map(s => [s, 0]));
  return calculateTT200m(zeroStats, metas);
}

function calculateMaxedEHP(metas: SkillMetaConfig[]) {
  const zeroStats = Object.fromEntries(Skills.map(s => [s, 0]));
  const maxedStats = Object.fromEntries(Skills.map(s => [s, SKILL_EXP_AT_99]));
  return calculateTT200m(zeroStats, metas) - calculateTT200m(maxedStats, metas);
}

function calculateBossEHB(boss: BossEnum, killcount: number, metas: BossMetaConfig[]) {
  if (!killcount || killcount <= 0) return 0;

  const meta = metas.find(meta => meta.boss === boss);
  if (!meta || meta.rate <= 0) return 0;

  return killcount / meta.rate;
}

function calculateEHB(killcountMap: KillcountMap, metas: BossMetaConfig[]) {
  return Bosses.map(b => calculateBossEHB(b, killcountMap[b], metas)).reduce((a, c) => a + c);
}

function calculateTT200m(experienceMap: ExperienceMap, metas: SkillMetaConfig[]): number {
  const startBonusExp = calculateBonuses(experienceMap, getBonuses(metas, BonusType.START));
  const endBonusExp = calculateBonuses(experienceMap, getBonuses(metas, BonusType.END));

  const startExps = Object.fromEntries(Skills.map(s => [s, experienceMap[s] + (startBonusExp[s] || 0)]));

  const targetExps = Object.fromEntries(
    Skills.map(s => [s, s in endBonusExp ? MAX_SKILL_EXP - endBonusExp[s] : MAX_SKILL_EXP])
  );

  const skillTimes = Skills.map(skill => {
    if (skill === MetricEnum.OVERALL) return 0;

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
  return skillTimes.reduce((a, c) => a + c);
}
