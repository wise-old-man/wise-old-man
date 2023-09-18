import { Skill, Boss, MapOf } from '../../../utils';

export type ExperienceMap = MapOf<Skill, number>;
export type KillcountMap = MapOf<Boss, number>;

export type EfficiencyMap = ExperienceMap & KillcountMap;

export enum BonusType {
  START,
  END
}

export enum EfficiencyAlgorithmType {
  MAIN = 'main',
  IRONMAN = 'ironman',
  ULTIMATE = 'ultimate',
  LVL3 = 'lvl3',
  F2P = 'f2p',
  F2P_LVL3 = 'f2p_lvl3',
  F2P_IRONMAN = 'f2p_ironman'
}

export interface SkillMetaMethod {
  rate: number;
  realRate?: number;
  startExp: number;
  description: string;
}

export interface SkillMetaConfig {
  skill: Skill;
  methods: Array<SkillMetaMethod>;
  bonuses: Bonus[];
}

export interface BossMetaConfig {
  boss: Boss;
  rate: number;
}

export interface Bonus {
  originSkill: Skill;
  bonusSkill: Skill;
  startExp: number;
  endExp: number;
  maxBonus?: number;
  end: boolean;
  ratio: number;
}

export interface EfficiencyAlgorithm {
  skillMetas: SkillMetaConfig[];
  bossMetas: BossMetaConfig[];
  maximumEHP: number;
  maxedEHP: number;
  calculateEHB(killcountMap: KillcountMap): number;
  calculateEHP(experienceMap: ExperienceMap): number;
  calculateTTM(experienceMap: ExperienceMap): number;
  calculateTT200m(experienceMap: ExperienceMap): number;
  calculateSkillEHP(skill: Skill, experienceMap: ExperienceMap): number;
  calculateBossEHB(boss: Boss, killcountMap: KillcountMap): number;
}

export type AlgorithmCache = MapOf<EfficiencyAlgorithmType, EfficiencyAlgorithm>;
