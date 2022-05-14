import { SkillEnum, BossEnum } from '../../../prisma';

export type ExperienceMap = {
  [skill in SkillEnum]?: number;
};

export type KillcountMap = {
  [boss in BossEnum]?: number;
};

export type EfficiencyMap = {
  [m in SkillEnum | BossEnum]?: number;
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
  skill: SkillEnum;
  methods: Array<{
    rate: number;
    startExp: number;
    description: string;
  }>;
  bonuses: Bonus[];
}

export interface BossMetaConfig {
  boss: BossEnum;
  rate: number;
}

export interface Bonus {
  originSkill: SkillEnum;
  bonusSkill: SkillEnum;
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
  calculateSkillEHP(skill: SkillEnum, experienceMap: ExperienceMap): number;
  calculateBossEHB(boss: BossEnum, killcountMap: KillcountMap): number;
}

export type AlgorithmCache = {
  [a in EfficiencyAlgorithmType]: EfficiencyAlgorithm;
};
