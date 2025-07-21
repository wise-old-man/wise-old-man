import { Skill } from './metric.enum';

export interface SkillMetaBonus {
  originSkill: Skill;
  bonusSkill: Skill;
  startExp: number;
  endExp: number;
  maxBonus?: number;
  end: boolean;
  ratio: number;
}
