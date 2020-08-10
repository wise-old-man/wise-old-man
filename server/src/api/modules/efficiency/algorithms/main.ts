import { Algorithm, BossMeta, Experiences, Killcounts, SkillMeta } from 'types';
import { calculateBossEHB, calculateEHB, calculateMaxEHP, calculateTTM } from '../util';
import mainBossingMetas from '../configs/ehb/main.ehb';
import mainSkillingMetas from '../configs/ehp/main.ehp';

class MainAlgorithm implements Algorithm {
  type: string;
  skillMetas: SkillMeta[];
  bossMetas: BossMeta[];
  maxEHP: number;

  constructor() {
    this.type = 'main';
    this.skillMetas = mainSkillingMetas;
    this.bossMetas = mainBossingMetas;
    this.maxEHP = this.calculateMaxEHP();
  }

  calculateMaxEHP(): number {
    return calculateMaxEHP(this.skillMetas);
  }

  calculateTTM(experiences: Experiences): number {
    return calculateTTM(experiences, this.skillMetas);
  }

  calculateEHP(experiences: Experiences): number {
    return this.maxEHP - this.calculateTTM(experiences);
  }

  calculateSkillEHP(skill: string, experiences: Experiences): number {
    return this.calculateTTM({ ...experiences, [skill]: 0 }) - this.calculateTTM(experiences);
  }

  calculateEHB(killcounts: Killcounts): number {
    return calculateEHB(killcounts, this.bossMetas);
  }

  calculateBossEHB(boss: string, killcounts: Killcounts) {
    return calculateBossEHB(boss, killcounts, this.bossMetas);
  }
}

export default new MainAlgorithm();
