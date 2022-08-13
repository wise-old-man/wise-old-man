import { Skill, Boss } from '../../../utils';

export type ExperienceMap = {
  [skill in Skill]?: number;
};

export type KillcountMap = {
  [boss in Boss]?: number;
};

export type EfficiencyMap = {
  [m in Skill | Boss]?: number;
};

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

export type AlgorithmCache = {
  [a in EfficiencyAlgorithmType]: EfficiencyAlgorithm;
};
