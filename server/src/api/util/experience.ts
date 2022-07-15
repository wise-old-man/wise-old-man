import { Snapshot } from '../../database/models';
import {
  getCombatLevel as calcCombat,
  getLevel,
  SKILLS,
  Metrics,
  getMetricValueKey,
  BOSSES,
  F2P_BOSSES,
  MEMBER_SKILLS,
  MAX_SKILL_EXP
} from '@wise-old-man/utils';

export function getMinimumExp(snapshot: Snapshot) {
  return SKILLS.filter(s => s !== Metrics.OVERALL)
    .map(s => Math.max(0, snapshot[getMetricValueKey(s)]))
    .sort((a, b) => a - b)[0];
}

export function getCappedExp(snapshot: Snapshot, max: number) {
  return SKILLS.filter(s => s !== Metrics.OVERALL)
    .map(s => Math.min(snapshot[getMetricValueKey(s)], max))
    .reduce((acc, cur) => acc + cur);
}

export function getCombatLevel(snapshot: Snapshot) {
  if (!snapshot) return 0;

  return calcCombat(
    getLevel(snapshot.attackExperience),
    getLevel(snapshot.strengthExperience),
    getLevel(snapshot.defenceExperience),
    getLevel(snapshot.rangedExperience),
    getLevel(snapshot.magicExperience),
    getLevel(snapshot.hitpointsExperience),
    getLevel(snapshot.prayerExperience)
  );
}

export function hasInfernoCape(snapshot: Snapshot) {
  return snapshot.tzkal_zukKills > 0;
}

export function hasMaxedSkill(snapshot: Snapshot) {
  return !! SKILLS.find(s => s !== Metrics.OVERALL && snapshot[getMetricValueKey(s)] === MAX_SKILL_EXP);
}

export function getTotalLevel(snapshot: Snapshot) {
  return SKILLS.filter(s => s !== Metrics.OVERALL)
    .map(s => getLevel(snapshot[getMetricValueKey(s)]))
    .reduce((acc, cur) => acc + cur);
}

export function get200msCount(snapshot: any) {
  return SKILLS.filter(s => s !== Metrics.OVERALL && snapshot[getMetricValueKey(s)] === MAX_SKILL_EXP).length;
}

export function isF2p(snapshot: Snapshot) {
  const hasMemberStats = MEMBER_SKILLS.some(s => getLevel(snapshot[getMetricValueKey(s)]) > 1);
  const hasBossKc = BOSSES.filter(b => !F2P_BOSSES.includes(b)).some(b => snapshot[getMetricValueKey(b)] > 0);

  return !hasMemberStats && !hasBossKc;
}

export function isLvl3(snapshot: Snapshot) {
  return getCombatLevel(snapshot) <= 3;
}

export function is1Def(snapshot: Snapshot) {
  return getLevel(snapshot.defenceExperience) === 1;
}

export function is10HP(snapshot: Snapshot) {
  return getCombatLevel(snapshot) > 3 && getLevel(snapshot.hitpointsExperience) === 10;
}

export function isZerker(snapshot: Snapshot) {
  return getLevel(snapshot.defenceExperience) === 45;
}
