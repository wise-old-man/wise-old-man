import { pick, transform } from 'lodash';
import { Snapshot } from '../../database/models';
import {
  BOSSES,
  COMBAT_SKILLS,
  F2P_BOSSES,
  MAX_LEVEL,
  MAX_VIRTUAL_LEVEL,
  MEMBER_SKILLS,
  SKILLS
} from '../constants';
import { getValueKey } from './metrics';

function getLevel(exp: number, virtual = false): number {
  // Unranked
  if (exp === -1) return 1;

  const maxlevel = virtual ? MAX_VIRTUAL_LEVEL : MAX_LEVEL;

  let accumulated = 0;

  for (let level = 1; level < maxlevel; level++) {
    const required = getXpDifferenceTo(level + 1);

    if (exp >= accumulated && exp < accumulated + required) {
      return level;
    }

    accumulated += required;
  }

  return maxlevel;
}

function getXpDifferenceTo(level: number): number {
  if (level < 2) return 0;
  return Math.floor(level - 1 + 300 * 2 ** ((level - 1) / 7)) / 4;
}

function getCombatLevel(snapshot: any) {
  const combatExperiences = pick(
    snapshot,
    COMBAT_SKILLS.map(s => getValueKey(s))
  );

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
  const baseCombat = 0.25 * (defence + hitpoints + Math.floor(prayer / 2));
  const meleeCombat = 0.325 * (attack + strength);
  const rangeCombat = 0.325 * Math.floor((3 * ranged) / 2);
  const mageCombat = 0.325 * Math.floor((3 * magic) / 2);
  const combatLevel = Math.floor(baseCombat + Math.max(meleeCombat, rangeCombat, mageCombat));

  return combatLevel;
}

function getTotalLevel(snapshot) {
  return SKILLS.filter(skill => skill !== 'overall')
    .map(s => getLevel(snapshot[getValueKey(s)]))
    .reduce((acc, cur) => acc + cur);
}

function get200msCount(snapshot: any) {
  const validSkills = SKILLS.filter(skill => skill !== 'overall');
  return validSkills.filter(skill => snapshot[getValueKey(skill)] === 200000000).length;
}

function isF2p(snapshot: Snapshot) {
  const hasMemberStats = MEMBER_SKILLS.some(s => getLevel(snapshot[getValueKey(s)]) > 1);
  const hasBossKc = BOSSES.filter(b => !F2P_BOSSES.includes(b)).some(b => snapshot[getValueKey(b)] > 0);

  return !hasMemberStats && !hasBossKc;
}

function isLvl3(snapshot: Snapshot) {
  return getCombatLevel(snapshot) <= 3;
}

function is1Def(snapshot: Snapshot) {
  return getLevel(snapshot.defenceExperience) === 1;
}

function is10HP(snapshot: Snapshot) {
  return getCombatLevel(snapshot) > 3 && getLevel(snapshot.hitpointsExperience) <= 10;
}

export { getLevel, getCombatLevel, getTotalLevel, get200msCount, is1Def, isF2p, isLvl3, is10HP };
