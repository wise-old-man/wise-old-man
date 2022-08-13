import { Snapshot } from '../prisma';
import { BOSSES, F2P_BOSSES, getMetricValueKey, MEMBER_SKILLS, REAL_SKILLS } from './metrics';

// Maximum effective skill level at 13,034,431 experience.
const MAX_LEVEL = 99;

// The maximum virtual skill level for any skill (200M experience).
const MAX_VIRTUAL_LEVEL = 126;

// The maximum skill experience (200M experience).
const MAX_SKILL_EXP = 200_000_000;

// The minimum skill exp for level 99
const SKILL_EXP_AT_99 = 13_034_431;

// The maximum skill at exactly 99 on all skills
const CAPPED_MAX_TOTAL_XP = 23 * SKILL_EXP_AT_99;

// Builds a lookup table for each level's required experience
// exp = XP_FOR_LEVEL[level - 1] || 13m = XP_FOR_LEVEL[98]
const XP_FOR_LEVEL = (function () {
  let xp = 0;
  const array: number[] = [];

  for (let level = 1; level <= MAX_VIRTUAL_LEVEL; ++level) {
    array[level - 1] = Math.floor(xp / 4);
    xp += Math.floor(level + 300 * Math.pow(2, level / 7));
  }

  return array;
})();

function getExpForLevel(level: number): number {
  if (level < 1 || level > MAX_VIRTUAL_LEVEL) return 0;
  return XP_FOR_LEVEL[level - 1];
}

function getLevel(exp: number, virtual = false): number {
  if (!exp || exp < 0) {
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

function getCombatLevelFromExp(
  attack: number,
  strength: number,
  defence: number,
  ranged: number,
  magic: number,
  hitpoints: number,
  prayer: number
) {
  if ([attack, strength, defence, ranged, magic, hitpoints, prayer].some(l => l === 0)) return 0;

  const baseCombat = 0.25 * (defence + Math.max(hitpoints, 10) + Math.floor(prayer / 2));
  const meleeCombat = 0.325 * (attack + strength);
  const rangeCombat = 0.325 * Math.floor((3 * ranged) / 2);
  const mageCombat = 0.325 * Math.floor((3 * magic) / 2);
  return Math.floor(baseCombat + Math.max(meleeCombat, rangeCombat, mageCombat));
}

function getCombatLevel(snapshot: Snapshot) {
  if (!snapshot) return 3;

  return getCombatLevelFromExp(
    getLevel(snapshot.attackExperience),
    getLevel(snapshot.strengthExperience),
    getLevel(snapshot.defenceExperience),
    getLevel(snapshot.rangedExperience),
    getLevel(snapshot.magicExperience),
    getLevel(snapshot.hitpointsExperience),
    getLevel(snapshot.prayerExperience)
  );
}

function get200msCount(snapshot: any) {
  return REAL_SKILLS.filter(s => snapshot[getMetricValueKey(s)] === MAX_SKILL_EXP).length;
}

function getMinimumExp(snapshot: Snapshot) {
  return REAL_SKILLS.map(s => Math.max(0, snapshot[getMetricValueKey(s)] || 0)).sort((a, b) => a - b)[0];
}

function getCappedExp(snapshot: Snapshot, max: number) {
  return REAL_SKILLS.map(s => Math.min(snapshot[getMetricValueKey(s)], max)).reduce((acc, cur) => acc + cur);
}

function getTotalLevel(snapshot: Snapshot) {
  return REAL_SKILLS.map(s => getLevel(snapshot[getMetricValueKey(s)])).reduce((acc, cur) => acc + cur);
}

function isF2p(snapshot: Snapshot) {
  const hasMemberStats = MEMBER_SKILLS.some(s => getLevel(snapshot[getMetricValueKey(s)]) > 1);
  const hasBossKc = BOSSES.filter(b => !F2P_BOSSES.includes(b)).some(b => snapshot[getMetricValueKey(b)] > 0);

  return !hasMemberStats && !hasBossKc;
}

function isLvl3(snapshot: Snapshot) {
  return getCombatLevel(snapshot) <= 3;
}

function is1Def(snapshot: Snapshot) {
  return getLevel(snapshot.defenceExperience) === 1;
}

function is10HP(snapshot: Snapshot) {
  return getCombatLevel(snapshot) > 3 && getLevel(snapshot.hitpointsExperience) === 10;
}

function isZerker(snapshot: Snapshot) {
  return getLevel(snapshot.defenceExperience) === 45;
}

export {
  // Constants
  MAX_LEVEL,
  MAX_VIRTUAL_LEVEL,
  MAX_SKILL_EXP,
  CAPPED_MAX_TOTAL_XP,
  SKILL_EXP_AT_99,
  // Functions
  getCombatLevel,
  getCombatLevelFromExp,
  getExpForLevel,
  getLevel,
  isF2p,
  isLvl3,
  is1Def,
  is10HP,
  isZerker,
  get200msCount,
  getMinimumExp,
  getTotalLevel,
  getCappedExp
};
