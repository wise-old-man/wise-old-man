import { Skill } from './metric.enum';
import { SkillMetaBonus } from './skill-meta-bonus.type';
import { SkillMetaMethod } from './skill-meta-method.type';

export interface SkillMetaConfig {
  skill: Skill;
  methods: Array<SkillMetaMethod>;
  bonuses: SkillMetaBonus[];
}
