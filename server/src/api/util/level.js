const { LEVEL_EXP } = require('../constants/levels');

function getLevel(experience) {
  let index;

  for (index = 0; index < LEVEL_EXP.length; index += 1) {
    if (LEVEL_EXP[index + 1] > experience) {
      break;
    }
  }

  return Math.min(index, 99);
}

function getCombatLevel(
  attackLevel,
  strengthLevel,
  defenceLevel,
  hitpointsLevel,
  rangedLevel,
  prayerLevel,
  magicLevel
) {
  // If the player has at least one of the stats as level 0 the calculation becomes incorrect
  // This is due to the player not being on the Hiscores
  if (
    [
      attackLevel,
      strengthLevel,
      defenceLevel,
      hitpointsLevel,
      rangedLevel,
      prayerLevel,
      magicLevel
    ].some(level => level === 0)
  ) {
    return '-';
  }

  // Formula from https://oldschool.runescape.wiki/w/Combat_level
  // Calculate the combat level
  const baseCombat = 0.25 * (defenceLevel + hitpointsLevel + Math.floor(prayerLevel / 2));
  const meleeCombat = 0.325 * (attackLevel + strengthLevel);
  const rangeCombat = 0.325 * Math.floor((3 * rangedLevel) / 2);
  const mageCombat = 0.325 * Math.floor((3 * magicLevel) / 2);
  const combatLevel = Math.floor(baseCombat + Math.max(meleeCombat, rangeCombat, mageCombat));

  return Math.max(combatLevel, 3);
}

exports.getLevel = getLevel;
exports.getCombatLevel = getCombatLevel;
