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
  LVL3 = 'lvl3',
  F2P = 'f2p'
}

export interface SkillMetaConfig {
  skill: Skill;
  methods: Array<{
    rate: number;
    startExp: number;
    description: string;
  }>;
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
  end: boolean;
  ratio: number;
  maxBonus?: number;
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
