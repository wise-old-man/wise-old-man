import prisma, { Snapshot } from '../../../../prisma';
import { findPlayerSnapshots } from '../../snapshots/services/FindPlayerSnapshotsService';
import { calculatePastDates, getAchievementDefinitions } from '../achievement.utils';

const ALL_DEFINITIONS = getAchievementDefinitions();
const UNKNOWN_DATE = new Date(0);

async function syncPlayerAchievements(playerId: number, previous: Snapshot | undefined, current: Snapshot) {
  if (!previous) {
    // If this is the first time player's being updated, find missing achievements and set them to "unknown" date
    const missingAchievements = ALL_DEFINITIONS.filter(d => d.validate(current)).map(
      ({ name, metric, threshold }) => {
        return { playerId, name, metric, threshold, createdAt: UNKNOWN_DATE, accuracy: null };
      }
    );

    // Add all missing achievements
    await prisma.achievement.createMany({ data: missingAchievements, skipDuplicates: true });

    return;
  }

  // Find all achievements the player already has
  const currentAchievements = await prisma.achievement.findMany({
    where: { playerId }
  });

  // Find any missing achievements (by comparing the SHOULD HAVE with the HAS IN DATABASE lists)
  const missingDefinitions = ALL_DEFINITIONS.filter(d => {
    return d.validate(previous) && !currentAchievements.find(e => e.name === d.name);
  });

  // Find any new achievements (only achieved since the last snapshot)
  const newDefinitions = ALL_DEFINITIONS.filter(d => {
    return !d.validate(previous) && d.validate(current);
  });

  // Nothing to add.
  if (newDefinitions.length === 0 && missingDefinitions.length === 0) {
    return;
  }

  // Search dates for missing definitions, based on player history
  const allSnapshots = await findPlayerSnapshots({ id: playerId });

  const missingPastDates = calculatePastDates(allSnapshots.reverse(), missingDefinitions);

  // Create achievement instances for all the missing definitions
  const missingAchievements = missingDefinitions.map(({ name, metric, threshold }) => {
    const missingAchievementData = missingPastDates[name];

    return {
      playerId,
      name,
      metric,
      threshold,
      accuracy: missingAchievementData?.accuracy || null,
      createdAt: missingAchievementData?.date || UNKNOWN_DATE
    };
  });

  // Create achievement instances for all the newly achieved definitions
  const newAchievements = newDefinitions.map(({ name, metric, threshold }) => {
    return {
      playerId,
      name,
      metric,
      threshold,
      createdAt: current.createdAt,
      accuracy: current.createdAt.getTime() - previous.createdAt.getTime()
    };
  });

  // Add all missing/new achievements
  await prisma.achievement.createMany({
    data: [...missingAchievements, ...newAchievements],
    skipDuplicates: true
  });
}

export { syncPlayerAchievements };
