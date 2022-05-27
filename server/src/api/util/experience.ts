import {
  getCombatLevel as calcCombat,
  getLevel,
  getMetricValueKey,
  F2P_BOSSES,
  MEMBER_SKILLS,
  MAX_SKILL_EXP
} from '@wise-old-man/utils';
import { Snapshot as PrismaSnapshot, Skills, MetricEnum, Bosses } from '../../prisma';
import { Snapshot } from '../../database/models';

export function getMinimumExp(snapshot: PrismaSnapshot) {
  return Skills.filter(s => s !== MetricEnum.OVERALL)
    .map(s => Math.max(0, snapshot[getMetricValueKey(s as any)]))
    .sort((a, b) => a - b)[0];
}

export function getCappedExp(snapshot: Snapshot, max: number) {
  return Skills.filter(s => s !== MetricEnum.OVERALL)
    .map(s => Math.min(snapshot[getMetricValueKey(s as any)], max))
    .reduce((acc, cur) => acc + cur);
}

export function getCombatLevel(snapshot: PrismaSnapshot) {
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

export function getTotalLevel(snapshot: Snapshot) {
  return Skills.filter(s => s !== MetricEnum.OVERALL)
    .map(s => getLevel(snapshot[getMetricValueKey(s as any)]))
    .reduce((acc, cur) => acc + cur);
}

export function get200msCount(snapshot: any) {
  return Skills.filter(
    s => s !== MetricEnum.OVERALL && snapshot[getMetricValueKey(s as any)] === MAX_SKILL_EXP
  ).length;
}

export function isF2p(snapshot: Snapshot) {
  const hasMemberStats = MEMBER_SKILLS.some(s => getLevel(snapshot[getMetricValueKey(s)]) > 1);
  const hasBossKc = Bosses.filter(b => !F2P_BOSSES.includes(b as any)).some(
    b => snapshot[getMetricValueKey(b as any)] > 0
  );

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
