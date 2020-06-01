import {
  SKILLS,
  BOSSES,
  ACTIVITIES,
  getValueKey,
  getFormattedName,
  isSkill,
  getMeasure,
  getDifficultyFactor
} from '../../constants/metrics';
import { SKILL_TEMPLATES, ACTIVITY_TEMPLATES, BOSS_TEMPLATES } from './achievement.templates';
import { Achievement, sequelize } from '../../../database';
import database from '../../../database';
import * as snapshotService from '../snapshots/snapshot.service';

function formatThreshold(threshold) {
  if (threshold < 1000 || threshold === 2277) {
    return threshold;
  }

  if (threshold === 13034431) {
    return '99';
  }

  if (threshold <= 10000) {
    return `${Math.floor(threshold / 1000)}k`;
  }

  if (threshold < 1000000000) {
    return `${Math.round((threshold / 1000000 + Number.EPSILON) * 100) / 100}m`;
  }

  return `${Math.round((threshold / 1000000000 + Number.EPSILON) * 100) / 100}b`;
}

function formatType(baseType, threshold, metric) {
  return baseType
    .replace('{threshold}', formatThreshold(threshold))
    .replace('{skill}', getFormattedName(metric))
    .replace('{activity}', getFormattedName(metric))
    .replace('{boss}', getFormattedName(metric));
}

/**
 * Get all achievement definitions (hydrated templates)
 */
function getDefinitions() {
  const definitions = [];

  SKILL_TEMPLATES.forEach((template: any) => {
    const { metric, thresholds, type, validate } = template;

    // Dynamic threshold/skill templates (Ex: 99 Attack, 50m Cooking)
    if (!metric) {
      SKILLS.filter(s => s !== 'overall').forEach(skill => {
        thresholds
          .map(t => t * getDifficultyFactor(skill))
          .forEach(threshold => {
            const newType = formatType(type, threshold, skill);
            const newValidate = snapshot => snapshot[getValueKey(skill)] >= threshold;

            definitions.push({ type: newType, metric: skill, threshold, validate: newValidate });
          });
      });
    } else if (thresholds.length > 1) {
      // Dynamic threshold templates, fixed skill (Ex: 500m Overall, 1b Overall)
      thresholds
        .map(t => t * getDifficultyFactor(metric))
        .forEach(threshold => {
          const newType = formatType(type, threshold, metric);
          const newValidate = snapshot => snapshot[getValueKey(metric)] >= threshold;

          definitions.push({ type: newType, metric, threshold, validate: newValidate });
        });
    } else {
      // Fixed threshold & metric (Ex: Maxed combat, Maxed overall)
      const threshold = thresholds[0] * getDifficultyFactor(metric);
      definitions.push({ type, metric, threshold, validate });
    }
  });

  ACTIVITY_TEMPLATES.forEach((template: any) => {
    const { metric, thresholds, type, validate } = template;

    // Dynamic threshold/activity templates (Ex: 1k Clues (Hard), 5k Clues (Medium))
    if (!metric) {
      ACTIVITIES.forEach(activity => {
        thresholds
          .map(t => t * getDifficultyFactor(activity))
          .forEach(threshold => {
            const newType = formatType(type, threshold, activity);
            const newValidate = snapshot => snapshot[getValueKey(activity)] >= threshold;

            definitions.push({ type: newType, metric: activity, threshold, validate: newValidate });
          });
      });
    } else if (thresholds.length > 1) {
      thresholds
        .map(t => t * getDifficultyFactor(metric))
        .forEach(threshold => {
          const newType = formatType(type, threshold, metric);
          const newValidate = snapshot => snapshot[getValueKey(metric)] >= threshold;

          definitions.push({ type: newType, metric, threshold, validate: newValidate });
        });
    } else {
      const threshold = thresholds[0] * getDifficultyFactor(metric);
      definitions.push({ type, metric, threshold, validate });
    }
  });

  BOSS_TEMPLATES.forEach((template: any) => {
    const { metric, thresholds, type, validate } = template;

    // Dynamic threshold/boss templates (Ex: 500 Cerberus, 1k Zulrah)
    if (!metric) {
      BOSSES.forEach(boss => {
        thresholds
          .map(t => t * getDifficultyFactor(boss))
          .forEach(threshold => {
            const newType = formatType(type, threshold, boss);
            const newValidate = snapshot => snapshot[getValueKey(boss)] >= threshold;

            definitions.push({ type: newType, metric: boss, threshold, validate: newValidate });
          });
      });
    } else if (thresholds.length > 1) {
      thresholds
        .map(t => t * getDifficultyFactor(metric))
        .forEach(threshold => {
          const newType = formatType(type, threshold, metric);
          const newValidate = snapshot => snapshot[getValueKey(metric)] >= threshold;

          definitions.push({ type: newType, metric, threshold, validate: newValidate });
        });
    } else {
      const threshold = thresholds[0] * getDifficultyFactor(metric);
      definitions.push({ type, metric, threshold, validate });
    }
  });

  return definitions;
}

/**
 * Searches through the player's snapshot history
 * to try and determine the date of a missing achievement.
 */
async function addPastDates(playerId, achievements) {
  if (!achievements || achievements.length === 0) {
    return [];
  }

  const allSnapshots = await snapshotService.findAll(playerId, 1000);

  if (!allSnapshots || allSnapshots.length < 2) {
    return achievements;
  }

  // Format: {'1k Zulrah kills': *date*, '99 Strength': *date*}
  const dateMap = {};

  for (let i = 0; i < allSnapshots.length - 1; i++) {
    const prev = allSnapshots[i];
    const next = allSnapshots[i + 1];

    const newAchievements = getNewAchievements(prev, next);

    if (newAchievements.length > 0) {
      newAchievements.forEach(a => {
        if (!dateMap[a.type]) {
          dateMap[a.type] = new Date(Math.min(a.createdAt, next.createdAt));
        }
      });
    }
  }

  return achievements.map(a => {
    return { ...a, createdAt: dateMap[a.type] || a.createdAt };
  });
}

/**
 * Calculates any new achievements whose thresholds were
 * crossed in between the current and previous snapshot.
 *
 * Ex: previous had 965 zulrah kills, now I have 1018, so I
 * should be awarded with the "1k Zulrah kills" achievement
 */
function getNewAchievements(current, previous) {
  if (!current || !previous) {
    return [];
  }

  const newAchievements = getDefinitions()
    .map(def => {
      const { metric, validate } = def;
      const key = getValueKey(metric);

      if (!validate(previous) && validate(current)) {
        // If the previous value was untracked, the achievement date is unknown
        const createdAt = previous[key] === -1 ? new Date(0) : new Date();
        return { ...def, createdAt };
      }

      return null;
    })
    .filter(a => a);

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

  const previousAchievements = getDefinitions()
    .map(def => {
      if (def.validate(previousSnapshot)) {
        return { ...def, createdAt: new Date(0) };
      }

      return null;
    })
    .filter(a => a);

  return previousAchievements;
}

/**
 * Go through the player's "unknown" date achievements, and try
 * to determine their date by searching through the player's snapshot
 * history. (Helps when importing CML history)
 */
async function reevaluateAchievements(playerId) {
  // Find all unknown date achievements
  const unknown = await Achievement.findAll({ where: { playerId, createdAt: new Date(0) } });

  // Attach dates to as many unknown achievements as possible
  const datedUnknownAchievements = await addPastDates(
    playerId,
    unknown.map(u => ({ type: u.type, createdAt: u.createdAt }))
  );

  // Include only achievements with a valid (not unknown) date
  const toUpdate = datedUnknownAchievements.filter(d => d.createdAt > 0).map(t => ({ ...t, playerId }));

  if (toUpdate && toUpdate.length > 0) {
    const transaction = await sequelize.transaction();

    // Remove outdated achievements
    await Achievement.destroy({ where: { playerId, type: toUpdate.map(t => t.type) }, transaction });

    // Re-add them with the correct date
    await Achievement.bulkCreate(toUpdate, { transaction, ignoreDuplicates: true });

    await transaction.commit();
  }
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

  // Find all achievements the player should have had (in the previous update)
  const previousAchievements = getPreviousAchievements(previous).map(a => ({ ...a, playerId }));

  // Find any missing achievements (by comparing the SHOULD HAVE with the HAS IN DATABASE lists)
  const missingAchievements = previousAchievements.filter(
    a => !existingAchievements.find(e => e.type === a.type)
  );

  const datedMissingAchievements = await addPastDates(playerId, missingAchievements);

  // Find any new achievements (only achieved since the last snapshot)
  const newAchievements = getNewAchievements(current, previous).map(a => ({ ...a, playerId }));

  // Combine missing and new achievements
  const toInsert = [...datedMissingAchievements, ...newAchievements];

  if (!toInsert || !toInsert.length) {
    return;
  }

  await Achievement.bulkCreate(toInsert, { ignoreDuplicates: true });
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
  }).map(a => a.toJSON());

  if (!includeMissing) {
    return achievements;
  }

  const achievedTypes = achievements.map(a => a.type);
  const definitions = getDefinitions();

  const missingAchievements = definitions
    .filter(d => !achievedTypes.includes(d.type))
    .map(({ type, metric, threshold }) => ({
      playerId: parseInt(playerId, 10),
      type,
      metric,
      threshold,
      createdAt: null,
      missing: true
    }));

  return [...achievements, ...missingAchievements].map(a => {
    // Only maxed overall and maxed combat are level based
    const isLevels = (isSkill(a.metric) && a.threshold < 1000000) || a.metric === 'combat';
    const measure = isLevels ? 'levels' : getMeasure(a.metric);
    return { ...a, measure };
  });
}

export {
  syncAchievements,
  reevaluateAchievements,
  findAll
}