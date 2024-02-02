import { Skill, Boss } from '../../../utils';

export enum EfficiencyAlgorithmType {
  MAIN = 'main',
  IRONMAN = 'ironman',
  ULTIMATE = 'ultimate',
  LVL3 = 'lvl3',
  F2P = 'f2p',
  F2P_LVL3 = 'f2p_lvl3',
  F2P_IRONMAN = 'f2p_ironman',
  F2P_LVL3_IRONMAN = 'f2p_lvl3_ironman'
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
