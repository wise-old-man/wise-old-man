import { pick, transform } from 'lodash';
import {
  BOSSES,
  Metrics,
  SKILLS,
  getMetricValueKey,
  COMBAT_SKILLS,
  MEMBER_SKILLS,
  F2P_BOSSES
} from '@wise-old-man/utils';
import { Snapshot } from 'src/database/models';

// Maximum effective skill level at 13,034,431 experience.
export const MAX_LEVEL = 99;

// The maximum virtual skill level for any skill (200M experience).
export const MAX_VIRTUAL_LEVEL = 126;

// The maximum skill experience (200M experience).
export const MAX_SKILL_EXP = 200_000_000;

// Builds a lookup table for each level's required experience
// exp = XP_FOR_LEVEL[level - 1] || 13m = XP_FOR_LEVEL[98]
export const XP_FOR_LEVEL = (function () {
  let xp = 0;
  const array = [];

  for (let level = 1; level <= MAX_VIRTUAL_LEVEL; ++level) {
    array[level - 1] = Math.floor(xp / 4);
    xp += Math.floor(level + 300 * Math.pow(2, level / 7));
  }

  return array;
})();

export function getXpForLevel(level: number): number {
  if (level < 1 || level > MAX_VIRTUAL_LEVEL) return 0;
  return XP_FOR_LEVEL[level - 1];
}

export function getLevel(exp: number, virtual = false): number {
  if (exp < 0) {
    return 1;
  }

  let low = 0;
  let high = virtual ? XP_FOR_LEVEL.length - 1 : 98;

  while (low <= high) {
    const mid = Math.floor(low + (high - low) / 2);
    const xpForLevel = XP_FOR_LEVEL[mid];

    if (exp < xpForLevel) {
      high = mid - 1;
    } else if (exp > xpForLevel) {
      low = mid + 1;
    } else {
      return mid + 1;
    }
  }

  return high + 1;
}

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

export function getCombatLevel(snapshot: any): number {
  const combatSkillKeys = COMBAT_SKILLS.map(s => getMetricValueKey(s));
  const combatExperiences = pick(snapshot, combatSkillKeys);

  const levels: any = transform(combatExperiences, (r, v, k) => {
    // eslint-disable-next-line no-param-reassign
    r[k.replace('Experience', '')] = getLevel(v);
  });

  // If the player has at least one of the stats as level 0 the calculation becomes incorrect
  // This is due to the player not being on the Hiscores
  if (Object.values(levels).some(level => level === 0)) return 0;

  const { defence, hitpoints, prayer, attack, strength, ranged, magic } = levels;

  // Formula from https://oldschool.runescape.wiki/w/Combat_level
  // Calculate the combat level
  const baseCombat = 0.25 * (defence + Math.max(hitpoints, 10) + Math.floor(prayer / 2));
  const meleeCombat = 0.325 * (attack + strength);
  const rangeCombat = 0.325 * Math.floor((3 * ranged) / 2);
  const mageCombat = 0.325 * Math.floor((3 * magic) / 2);
  const combatLevel = Math.floor(baseCombat + Math.max(meleeCombat, rangeCombat, mageCombat));

  return combatLevel;
}

export function getTotalLevel(snapshot) {
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
