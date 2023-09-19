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
  SKILL_EXP_AT_99,
  REAL_SKILLS,
  MapOf
} from '../../../utils';
import { mapValues } from '../../util/objects';
import {
  Bonus,
  BonusType,
  BossMetaConfig,
  EfficiencyAlgorithm,
  EfficiencyAlgorithmType,
  EfficiencyMap,
  ExperienceMap,
  KillcountMap,
  SkillMetaConfig,
  SkillMetaMethod
} from './efficiency.types';
import mainBossingMetas from './configs/ehb/main.ehb';
import mainSkillingMetas from './configs/ehp/main.ehp';
import ironmanBossingMetas from './configs/ehb/ironman.ehb';
import ironmanSkillingMetas from './configs/ehp/ironman.ehp';
import lvl3SkillingMetas from './configs/ehp/lvl3.ehp';
import f2pSkillingMetas from './configs/ehp/f2p.ehp';
import f2pLvl3SkillingMetas from './configs/ehp/f2p_lvl3.ehp';
import f2pIronmanSkillingMetas from './configs/ehp/f2p_ironman.ehp';
import f2pLvl3IronmanSkillingMetas from './configs/ehp/f2p_lvl3_ironman.ehp';
import ultimateSkillingMetas from './configs/ehp/ultimate.ehp';

const ZERO_STATS = Object.fromEntries(SKILLS.map(s => [s, 0])) as ExperienceMap;
const MAXED_STATS = Object.fromEntries(SKILLS.map(s => [s, SKILL_EXP_AT_99])) as ExperienceMap;

export const ALGORITHMS = new Map<EfficiencyAlgorithmType, EfficiencyAlgorithm>(
  [
    buildAlgorithmCache(EfficiencyAlgorithmType.MAIN, mainSkillingMetas, mainBossingMetas),
    buildAlgorithmCache(EfficiencyAlgorithmType.IRONMAN, ironmanSkillingMetas, ironmanBossingMetas),
    buildAlgorithmCache(EfficiencyAlgorithmType.ULTIMATE, ultimateSkillingMetas, ironmanBossingMetas),
    buildAlgorithmCache(EfficiencyAlgorithmType.LVL3, lvl3SkillingMetas),
    buildAlgorithmCache(EfficiencyAlgorithmType.F2P, f2pSkillingMetas),
    buildAlgorithmCache(EfficiencyAlgorithmType.F2P_LVL3, f2pLvl3SkillingMetas),
    buildAlgorithmCache(EfficiencyAlgorithmType.F2P_IRONMAN, f2pIronmanSkillingMetas),
    buildAlgorithmCache(EfficiencyAlgorithmType.F2P_LVL3_IRONMAN, f2pLvl3IronmanSkillingMetas)
  ].map(a => [a.type, a])
);

/**
 * Builds a cache of the EHP/EHB algorithms for each player type and build.
 */
export function buildAlgorithmCache(
  type: EfficiencyAlgorithmType,
  skillMetas: SkillMetaConfig[],
  bossMetas: BossMetaConfig[] = []
) {
  const maxedEHP = _calculateTT200m(ZERO_STATS) - _calculateTT200m(MAXED_STATS);
  const maximumEHP = _calculateTT200m(ZERO_STATS);

  function _calculateTT200m(experienceMap: ExperienceMap) {
    return calculateTT200mMap(experienceMap, skillMetas)[Metric.OVERALL];
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
    type,
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

  const algorithm = ALGORITHMS.get(type || EfficiencyAlgorithmType.MAIN);

  return metric === Metric.EHB ? algorithm.bossMetas : algorithm.skillMetas;
}

export function getAlgorithm(player?: Pick<Player, 'type' | 'build'>): EfficiencyAlgorithm {
  const { type = PlayerType.REGULAR, build = PlayerBuild.MAIN } = player || {};

  if (
    build === PlayerBuild.F2P &&
    (type === PlayerType.ULTIMATE || type === PlayerType.IRONMAN || type === PlayerType.HARDCORE)
  ) {
    return ALGORITHMS.get(EfficiencyAlgorithmType.F2P_IRONMAN);
  }

  if (
    build === PlayerBuild.F2P_LVL3 &&
    (type === PlayerType.ULTIMATE || type === PlayerType.IRONMAN || type === PlayerType.HARDCORE)
  ) {
    return ALGORITHMS.get(EfficiencyAlgorithmType.F2P_LVL3_IRONMAN);
  }

  if (type === PlayerType.ULTIMATE) {
    return ALGORITHMS.get(EfficiencyAlgorithmType.ULTIMATE);
  }

  if (type === PlayerType.IRONMAN || type === PlayerType.HARDCORE) {
    return ALGORITHMS.get(EfficiencyAlgorithmType.IRONMAN);
  }

  switch (build) {
    case PlayerBuild.F2P_LVL3:
      return ALGORITHMS.get(EfficiencyAlgorithmType.F2P_LVL3);
    case PlayerBuild.F2P:
      return ALGORITHMS.get(EfficiencyAlgorithmType.F2P);
    case PlayerBuild.LVL3:
      return ALGORITHMS.get(EfficiencyAlgorithmType.LVL3);
    default:
      return ALGORITHMS.get(EfficiencyAlgorithmType.MAIN);
  }
}

function getBonuses(metas: SkillMetaConfig[], type?: BonusType): Bonus[] {
  return metas
    .filter(r => r.bonuses.length > 0)
    .map(r => r.bonuses)
    .flat()
    .filter(b => type === undefined || b?.end === (type === BonusType.END));
}

function calculateBonuses(experienceMap: ExperienceMap, bonuses: Bonus[], isStart: boolean) {
  // Creates an object with an entry for each bonus skill (0 bonus exp)
  const map = Object.fromEntries(bonuses.map(b => [b.bonusSkill, 0]));

  // Create a dependency map to determine the order in which bonuses should be applied
  const dependencyMap = new Map<Skill, Skill[]>();

  bonuses.forEach(b => {
    const dependants = dependencyMap.get(b.originSkill);

    if (dependants) {
      if (!dependants.includes(b.bonusSkill)) {
        dependencyMap.set(b.originSkill, [...dependants, b.bonusSkill]);
      }
    } else {
      dependencyMap.set(b.originSkill, [b.bonusSkill]);
    }
  });

  bonuses
    .sort((a, b) => {
      // Sort the bonuses by the number of dependencies they have.
      // This ensures skills with no received bonus exp are applied last.
      return (dependencyMap.get(b.bonusSkill)?.length ?? 0) - (dependencyMap.get(a.bonusSkill)?.length ?? 0);
    })
    .forEach(b => {
      const expCap = Math.min(b.endExp, MAX_SKILL_EXP);

      const originStart =
        Math.max(experienceMap[b.originSkill], b.startExp) + (isStart ? map[b.originSkill] ?? 0 : 0);

      const originEnd = !isStart && b.originSkill in map ? expCap - map[b.originSkill] : expCap;
      const bonusToApply = Math.max(0, originEnd - originStart) * b.ratio;

      map[b.bonusSkill] = Math.min(MAX_SKILL_EXP, map[b.bonusSkill] + bonusToApply);
    });

  return map;
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

function calculateTT200mMap(experienceMap: ExperienceMap, metas: SkillMetaConfig[]) {
  // Ensure unranked skills (-1) are treated as 0 exp
  const fixedMap = mapValues(experienceMap, exp => Math.max(0, exp));

  const startBonusExp = calculateBonuses(fixedMap, getBonuses(metas, BonusType.START), true);
  const startExps = Object.fromEntries(SKILLS.map(s => [s, fixedMap[s] + (startBonusExp[s] || 0)]));

  const endBonusExp = calculateBonuses(fixedMap as ExperienceMap, getBonuses(metas, BonusType.END), false);

  const endExps = Object.fromEntries(
    SKILLS.map(s => [s, s in endBonusExp ? MAX_SKILL_EXP - endBonusExp[s] : MAX_SKILL_EXP])
  );

  function calculateSkillTT200m(skill: Skill, startExp: number, useRealRates = false) {
    const methods = metas.find(sm => sm.skill === skill)?.methods;
    const endExp = endExps[skill];

    // Handle 0 time skills (Hitpoints, Magic, Fletching)
    if (!methods || (methods.length === 1 && methods[0].rate === 0)) {
      return (endExp - startExp) / MAX_SKILL_EXP;
    }

    let skillTime = 0;

    for (let i = 0; i < methods.length; i++) {
      const current = methods[i];
      const next = methods[i + 1];

      if (current.rate === 0) continue;

      const rate = useRealRates && current.realRate ? current.realRate : current.rate;

      // Start exp is within this method's boundaries
      if (next && next.startExp > startExp && current.startExp < endExp) {
        const gained = Math.min(next.startExp, endExp) - Math.max(startExp, current.startExp);
        skillTime += Math.max(0, gained / rate);
      }

      // End exp is beyond this method's boundaries
      if (!next && endExp > current.startExp) {
        const gained = endExp - Math.max(current.startExp, startExp);
        skillTime += Math.max(0, gained / rate);
      }
    }

    return skillTime;
  }

  function getScaledMaxBonus(
    originSkill: Skill,
    bonusSkill: Skill,
    originSkillMethod: SkillMetaMethod,
    bonusSkillMethod: SkillMetaMethod,
    bonusRatio: number
  ) {
    if (!originSkillMethod || !bonusSkillMethod || !bonusRatio) return undefined;

    const originSkillStart = Math.max(originSkillMethod.startExp, fixedMap[originSkill]);
    const bonusSkillStart = fixedMap[bonusSkill];

    const originExpLeft = MAX_SKILL_EXP - originSkillStart;

    const realTime =
      calculateSkillTT200m(originSkill, originSkillStart, true) +
      calculateSkillTT200m(bonusSkill, bonusSkillStart, true);

    const fakeTime =
      calculateSkillTT200m(originSkill, originSkillStart, false) +
      calculateSkillTT200m(bonusSkill, bonusSkillStart, false);

    const excessBonuses = (realTime - fakeTime) * bonusSkillMethod.rate;
    const fakeBonusLeft = originExpLeft * bonusRatio;

    return fakeBonusLeft - excessBonuses;
  }

  const driftNetScaledBonuses = getScaledMaxBonus(
    Skill.HUNTER,
    Skill.FISHING,
    metas.find(sm => sm.skill === Skill.HUNTER)?.methods.find(m => !!m.realRate),
    metas.find(sm => sm.skill === Skill.FISHING)?.methods.at(-1),
    metas.find(sm => sm.skill === Skill.HUNTER)?.bonuses[0]?.ratio
  );

  const swimmingScaledBonuses = getScaledMaxBonus(
    Skill.THIEVING,
    Skill.AGILITY,
    metas.find(sm => sm.skill === Skill.THIEVING)?.methods.find(m => !!m.realRate),
    metas.find(sm => sm.skill === Skill.AGILITY)?.methods.at(-1),
    metas.find(sm => sm.skill === Skill.THIEVING)?.bonuses[0]?.ratio
  );

  if (driftNetScaledBonuses) {
    endBonusExp[Skill.FISHING] = driftNetScaledBonuses;
    endExps[Skill.FISHING] = MAX_SKILL_EXP - driftNetScaledBonuses;
  }

  if (swimmingScaledBonuses) {
    endBonusExp[Skill.AGILITY] = swimmingScaledBonuses;
    endExps[Skill.AGILITY] = MAX_SKILL_EXP - swimmingScaledBonuses;
  }

  const map = Object.fromEntries(SKILLS.map(s => [s, 0])) as MapOf<Skill, number>;

  REAL_SKILLS.forEach(skill => {
    map[skill] = calculateSkillTT200m(skill, startExps[skill]);
  });

  const sum = Object.values(map).reduce((a, c) => a + c, 0);
  map[Metric.OVERALL] = round(sum, 5);

  return map;
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
