const { SKILLS, BOSSES, ACTIVITIES, getValueKey, getFormattedName } = require('../../constants/metrics');
const {
  SKILL_ACHIEVEMENTS,
  ACTIVITY_ACHIEVEMENTS,
  BOSS_ACHIEVEMENTS
} = require('../../constants/achievements');
const { Achievement } = require('../../../database');
const snapshotService = require('../snapshots/snapshot.service');

/**
 * Finds all achievements that should be attributed to a player.
 */
async function getAchievements(snapshot) {
  const achievements = [];

  SKILL_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{skill}')) {
      SKILLS.filter(s => s !== 'overall').forEach(skill => {
        if (a.validate(snapshot[getValueKey(skill)])) {
          achievements.push(a.name.replace('{skill}', getFormattedName(skill)));
        }
      });
    } else if (a.validate(snapshot)) {
      achievements.push(a.name);
    }
  });

  ACTIVITY_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{activity}')) {
      ACTIVITIES.forEach(activity => {
        if (a.validate(snapshot[getValueKey(activity)])) {
          achievements.push(a.name.replace('{activity}', getFormattedName(activity)));
        }
      });
    } else if (a.validate(snapshot)) {
      achievements.push(a.name);
    }
  });

  const prev = await snapshotService.findFirstBefore(snapshot.playerId, snapshot.createdAt);
  if (!prev) return achievements;

  BOSS_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{boss}')) {
      BOSSES.forEach(boss => {
        if (a.validate(snapshot[getValueKey(boss)]) && prev[getValueKey(boss)] !== -1) {
          achievements.push(a.name.replace('{boss}', getFormattedName(boss)));
        }
      });
    } else if (a.validate(snapshot) && prev) {
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

  SKILL_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{skill}')) {
      SKILLS.filter(s => s !== 'overall').forEach(skill => {
        types.push(a.name.replace('{skill}', getFormattedName(skill)));
      });
    } else {
      types.push(a.name);
    }
  });

  ACTIVITY_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{activity}')) {
      ACTIVITIES.forEach(activity => {
        types.push(a.name.replace('{activity}', getFormattedName(activity)));
      });
    } else {
      types.push(a.name);
    }
  });

  BOSS_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{boss}')) {
      BOSSES.forEach(boss => {
        types.push(a.name.replace('{boss}', getFormattedName(boss)));
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
