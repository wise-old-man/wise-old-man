import { pick, transform } from 'lodash';
import { MAX_LEVEL, MAX_VIRTUAL_LEVEL, SKILLS } from '../constants';
import { getValueKey } from '../util/metrics';

function getLevel(experience, virtual = false) {
  // Unranked
  if (experience === -1) {
    return 0;
  }

  const maxlevel = virtual ? MAX_VIRTUAL_LEVEL : MAX_LEVEL;

  let accumulated = 0;

  for (let level = 1; level < maxlevel; level++) {
    const required = getXpDifferenceTo(level + 1);

    if (experience >= accumulated && experience < accumulated + required) {
      return level;
    }

    accumulated += required;
  }

  return maxlevel;
}

function getXpDifferenceTo(level) {
  if (level < 2) return 0;
  return Math.floor(level - 1 + 300 * 2 ** ((level - 1) / 7)) / 4;
}

function getCombatLevel(snapshot: any) {
  const combatSkills = ['attack', 'strength', 'defence', 'hitpoints', 'ranged', 'prayer', 'magic'];

  const combatExperiences = pick(
    snapshot,
    combatSkills.map(s => `${s}Experience`)
  );

  const levels: any = transform(combatExperiences, (r, v, k) => {
    // eslint-disable-next-line no-param-reassign
    r[k.replace('Experience', '')] = getLevel(v);
  });

  // If the player has at least one of the stats as level 0 the calculation becomes incorrect
  // This is due to the player not being on the Hiscores
  if (Object.values(levels).some(level => level === 0)) {
    return 0;
  }

  // Formula from https://oldschool.runescape.wiki/w/Combat_level
  // Calculate the combat level
  const baseCombat = 0.25 * (levels.defence + levels.hitpoints + Math.floor(levels.prayer / 2));
  const meleeCombat = 0.325 * (levels.attack + levels.strength);
  const rangeCombat = 0.325 * Math.floor((3 * levels.ranged) / 2);
  const mageCombat = 0.325 * Math.floor((3 * levels.magic) / 2);
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

export { getLevel, getCombatLevel, getTotalLevel, get200msCount };
