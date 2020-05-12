const { SKILLS, BOSSES, ACTIVITIES, getValueKey, getFormattedName } = require('../../constants/metrics');
const {
  SKILL_ACHIEVEMENTS,
  ACTIVITY_ACHIEVEMENTS,
  BOSS_ACHIEVEMENTS
} = require('../../constants/achievements');
const { Achievement } = require('../../../database');
const snapshotService = require('../snapshots/snapshot.service');

/**
 * Calculates any new achievements whose thresholds were
 * crossed in between the current and previous snapshot.
 *
 * Ex: previous had 965 zulrah kills, now I have 1018, so I
 * should be awarded with the "1k Zulrah kills" achievement
 */
function getNewAchievements(currentSnapshot, previousSnapshot) {
  if (!currentSnapshot || !previousSnapshot) {
    return [];
  }

  const newAchievements = [];

  SKILL_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{skill}')) {
      SKILLS.filter(s => s !== 'overall').forEach(skill => {
        const key = getValueKey(skill);

        if (!a.validate(previousSnapshot[key]) && a.validate(currentSnapshot[key])) {
          const type = a.name.replace('{skill}', getFormattedName(skill));
          // If the previous value was untracked, the achievement date is unknown
          const createdAt = previousSnapshot[key] === -1 ? new Date(0) : new Date();

          newAchievements.push({ type, createdAt });
        }
      });
    } else if (!a.validate(previousSnapshot) && a.validate(currentSnapshot)) {
      newAchievements.push({ type: a.name, createdAt: new Date() });
    }
  });

  ACTIVITY_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{activity}')) {
      ACTIVITIES.forEach(activity => {
        const key = getValueKey(activity);
        if (!a.validate(previousSnapshot[key]) && a.validate(currentSnapshot[key])) {
          const type = a.name.replace('{activity}', getFormattedName(activity));
          // If the previous value was untracked, the achievement date is unknown
          const createdAt = previousSnapshot[key] === -1 ? new Date(0) : new Date();

          newAchievements.push({ type, createdAt });
        }
      });
    } else if (!a.validate(previousSnapshot) && a.validate(currentSnapshot)) {
      newAchievements.push({ type: a.name, createdAt: new Date() });
    }
  });

  BOSS_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{boss}')) {
      BOSSES.forEach(boss => {
        const key = getValueKey(boss);
        if (!a.validate(previousSnapshot[key]) && a.validate(currentSnapshot[key])) {
          const type = a.name.replace('{boss}', getFormattedName(boss));
          // If the previous value was untracked, the achievement date is unknown
          const createdAt = previousSnapshot[key] === -1 ? new Date(0) : new Date();

          newAchievements.push({ type, createdAt });
        }
      });
    } else if (!a.validate(previousSnapshot) && a.validate(currentSnapshot)) {
      newAchievements.push({ type: a.name, createdAt: new Date() });
    }
  });

  return newAchievements;
}

/**
 * Finds all achievements that a player SHOULD HAVE HAD
 * based on their previous snapshot.
 *
 * This is used to find any missing achievements (by comparing this listto the database)
 */
function getPreviousAchievements(previousSnapshot) {
  if (!previousSnapshot) {
    return [];
  }

  const previousAchievements = [];

  SKILL_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{skill}')) {
      SKILLS.filter(s => s !== 'overall').forEach(skill => {
        const key = getValueKey(skill);

        if (a.validate(previousSnapshot[key])) {
          previousAchievements.push({
            type: a.name.replace('{skill}', getFormattedName(skill)),
            createdAt: new Date(0)
          });
        }
      });
    } else if (a.validate(previousSnapshot)) {
      previousAchievements.push({ type: a.name, createdAt: new Date(0) });
    }
  });

  ACTIVITY_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{activity}')) {
      ACTIVITIES.forEach(activity => {
        const key = getValueKey(activity);
        if (a.validate(previousSnapshot[key])) {
          previousAchievements.push({
            type: a.name.replace('{activity}', getFormattedName(activity)),
            createdAt: new Date(0)
          });
        }
      });
    } else if (a.validate(previousSnapshot)) {
      previousAchievements.push({ type: a.name, createdAt: new Date(0) });
    }
  });

  BOSS_ACHIEVEMENTS.forEach(a => {
    if (a.name.includes('{boss}')) {
      BOSSES.forEach(boss => {
        const key = getValueKey(boss);
        if (a.validate(previousSnapshot[key])) {
          previousAchievements.push({
            type: a.name.replace('{boss}', getFormattedName(boss)),
            createdAt: new Date(0)
          });
        }
      });
    } else if (a.validate(previousSnapshot)) {
      previousAchievements.push({ type: a.name, createdAt: new Date(0) });
    }
  });

  return previousAchievements;
}

/**
 * Adds all missing player achievements.
 * (Since ignoreDuplicates is true, it will only insert unique achievements)
 */
async function syncAchievements(playerId) {
  const snapshots = await snapshotService.findAll(playerId, 10);

  if (!snapshots || snapshots.length < 2) {
    return;
  }

  const current = snapshots[0];
  const previous = snapshots[1];

  // Find all achievements the player already has
  const existingAchievements = await Achievement.findAll({ where: { playerId } });

  // Find all achievements the player should havehad (in the previous update)
  const previousAchievements = getPreviousAchievements(previous).map(a => ({ ...a, playerId }));

  // Find any missing achievements (by comparing the SHOULD HAVE with the HAS IN DATABASE lists)
  const missingAchievements = previousAchievements.filter(
    a => !existingAchievements.find(e => e.type === a.type)
  );

  // Find any new achievements (only achieved since the last snapshot)
  const newAchievements = getNewAchievements(current, previous).map(a => ({ ...a, playerId }));

  // Combine missing and new achievements
  const toInsert = [...missingAchievements, ...newAchievements];

  if (!toInsert || !toInsert.length) {
    return;
  }

  await Achievement.bulkCreate(toInsert, { ignoreDuplicates: true });
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
