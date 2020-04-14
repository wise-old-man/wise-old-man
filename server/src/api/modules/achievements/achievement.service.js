const { SKILLS } = require('../../constants/metrics');
const { ACHIEVEMENTS } = require('../../constants/achievements');
const { Achievement } = require('../../../database');
const snapshotService = require('../snapshots/snapshot.service');

/**
 * Finds all achievements that should be attributed to a player.
 */
function getAchievements(snapshot) {
  const achievements = [];

  ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{skill}')) {
      SKILLS.filter(s => s !== 'overall').forEach(skill => {
        if (a.validate(snapshot[`${skill}Experience`])) {
          achievements.push(a.name.replace('{skill}', skill));
        }
      });
    } else if (a.validate(snapshot)) {
      achievements.push(a.name);
    }
  });

  return achievements;
}

/**
 * Adds all missing player achievements.
 * (Since ignoreDuplicates is true, it will only insert unique achievements)
 */
async function syncAchievements(playerId) {
  const snapshots = await snapshotService.findAll(playerId, 10);

  if (!snapshots || snapshots.length === 0) {
    return;
  }

  // If it's a new player, then the achievement date is unknown,
  // so set it as the min unix date for "unknown"
  const createdAt = snapshots.length <= 1 ? new Date(0) : new Date();
  const newAchievements = getAchievements(snapshots[0]).map(type => ({ playerId, type, createdAt }));

  if (!newAchievements || !newAchievements.length) {
    return;
  }

  await Achievement.bulkCreate(newAchievements, { ignoreDuplicates: true });
}

/**
 * Gives a complete list of all achievement types, replacing dynamic values.
 * Ex: 99 {skill} is converted into [99 attack, 99 magic, 99 cooking, etc].
 */
function getAchievementTypes() {
  const types = [];

  ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{skill}')) {
      SKILLS.filter(s => s !== 'overall').forEach(skill => {
        types.push(a.name.replace('{skill}', skill));
      });
    } else {
      types.push(a.name);
    }
  });

  return types;
}

/**
 * Find all achievements for a given player id.
 *
 * If includeMissing, it will also include the missing
 * achievements, with a "missing" field set to true.
 */
async function findAll(playerId, includeMissing = false) {
  const achievements = await Achievement.findAll({
    where: { playerId }
  });

  if (!includeMissing) {
    return achievements;
  }

  const achievedTypes = achievements.map(a => a.type);
  const allTypes = getAchievementTypes();

  const missingAchievements = allTypes
    .filter(t => !achievedTypes.includes(t))
    .map(type => ({
      playerId: parseInt(playerId, 10),
      type,
      createdAt: null,
      missing: true
    }));

  return [...achievements, ...missingAchievements];
}

exports.syncAchievements = syncAchievements;
exports.findAll = findAll;
