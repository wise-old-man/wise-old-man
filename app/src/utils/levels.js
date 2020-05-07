import { MAX_LEVEL, MAX_VIRTUAL_LEVEL } from '../config';

export function getLevel(experience, virtual = false) {
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

export function getExperienceAt(level) {
  let accumulated = 0;

  for (let l = 1; l !== level + 1; l++) {
    accumulated += getXpDifferenceTo(l);
  }

  return accumulated;
}

function getXpDifferenceTo(level) {
  if (level < 2) {
    return 0;
  }

  return Math.floor(level - 1 + 300 * 2 ** ((level - 1) / 7)) / 4;
}

export function getCombatLevel(attackLevel, strengthLevel, defenceLevel, hitpointsLevel, rangedLevel, prayerLevel, magicLevel) {
  // If the player has at least one of the stats as level 0 the calculation becomes incorrect
  // This is due to the player not being on the Hiscores
  if (attackLevel === 0 || strengthLevel === 0 || defenceLevel === 0 || hitpointsLevel === 0 ||
      rangedLevel === 0 || prayerLevel === 0 || magicLevel === 0) {
    return '-';
  }

  // Formula from https://oldschool.runescape.wiki/w/Combat_level
  // Calculate the combat level
  const baseCombat = 0.25 * (defenceLevel + hitpointsLevel + Math.floor(prayerLevel / 2));
  const meleeCombat = 0.325 * (attackLevel + strengthLevel);
  const rangeCombat = 0.325 * Math.floor(3 * rangedLevel / 2);
  const mageCombat = 0.325 * Math.floor(3 * magicLevel / 2);
  const combatLevel = Math.floor(baseCombat + Math.max(meleeCombat, rangeCombat, mageCombat));

  return Math.max(combatLevel, 3);
}
