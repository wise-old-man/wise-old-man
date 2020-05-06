const { sequelize } = require('../../../database');

const { SKILLS } = require('../../constants/metrics');
const { ACHIEVEMENTS } = require('../../constants/achievements');
const { Achievement, Player } = require('../../../database');
const snapshotService = require('../snapshots/snapshot.service');
const playerService = require('../players/player.service');

/**
 * Finds all achievements that should be attributed to a player.
 */
function getAchievements(snapshots, prevAchievements) {
  const achievements = prevAchievements || {};

  // Return true if d1 is after d2
  const dateCmp = (d1, d2) => d1.getTime() > d2.getTime();

  // Return true if current achievement should replace the old one
  const achievementCheck = (type, newDate) => {
    const oldAchievement = achievements[type];
    // replace old achievement if it does not exist
    if (!oldAchievement) {
      return true;
    }

    const oldDate = new Date(achievements[type].createdAt);
    // replace old achievement if old timestamp is unix time 0
    if (oldDate.getTime() === 0) {
      return true;
    }

    // replace old achievement if new time date is before old date
    return dateCmp(oldDate, new Date(newDate));
  };

  // Check if each snapshot will create a new achievement
  snapshots.forEach(snapshot => {
    const { playerId, createdAt } = snapshot;
    ACHIEVEMENTS.forEach(a => {
      if (a.name.includes('{skill}')) {
        SKILLS.filter(s => s !== 'overall').forEach(skill => {
          if (a.validate(snapshot[`${skill}Experience`])) {
            const type = a.name.replace('{skill}', skill);
            if (achievementCheck(type, createdAt)) {
              achievements[type] = { playerId, type, createdAt };
            }
          }
        });
      } else if (a.validate(snapshot)) {
        const type = a.name;
        if (achievementCheck(type, createdAt)) {
          achievements[type] = { playerId, type, createdAt };
        }
      }
    });
  });

  return achievements;
}

/**
 * Adds all missing player achievements.
 * (Since ignoreDuplicates is true, it will only insert unique achievements)
 */
async function syncAchievements(playerId) {
  const player = await playerService.findById(playerId);
  if (!player) return;

  // Get all snapshots that exist that have not been checked for achievements
  const snapshots = await snapshotService.findAllBetween(
    playerId,
    new Date(player.lastUpdatedAchievementsAt),
    new Date()
  );

  const prevAchievements = await Achievement.findAll({ where: { playerId } });

  // compare previous achievements with new snapshots to see if new achievements should be created
  const newAchievements = Object.values(
    getAchievements(
      snapshots,
      prevAchievements.map(a => ({
        type: a.type,
        createdAt: a.createdAt,
        playerId: a.playerId
      }))
    )
  );

  if (!newAchievements || !newAchievements.length || false) {
    return;
  }

  const transaction = await sequelize.transaction();

  try {
    // create or replace existing achievements based on playerId and type
    newAchievements.forEach(async a => {
      const { type } = a;
      await Achievement.upsert(a, { where: { playerId, type } });
    });
    // set last updated to current time to prevent rechecking old snapshots
    await Player.update(
      { lastUpdatedAchievementsAt: new Date() },
      { where: { id: playerId }, silent: true }
    );

    transaction.commit();
  } catch (e) {
    console.log('commit failed:', e);
    transaction.rollback();
  }
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
