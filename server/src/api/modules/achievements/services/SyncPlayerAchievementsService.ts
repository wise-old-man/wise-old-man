import prisma, { Snapshot } from '../../../../prisma';
import { getMetricValueKey, Metric } from '../../../../utils';
import { findPlayerSnapshots } from '../../snapshots/services/FindPlayerSnapshotsService';
import { onAchievementsCreated } from '../achievement.events';
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

    if (missingAchievements.length === 0) {
      return;
    }

    // Add all missing achievements
    await prisma.achievement.createMany({ data: missingAchievements, skipDuplicates: true });

    onAchievementsCreated(missingAchievements);

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
  const allSnapshots = await findPlayerSnapshots(playerId);

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
    // Some metrics are introduced to the hiscores way after they have been added in-game,
    // this causes players to go from -1 to achievement thresholds in a single update,
    // which incorrectly attributes the achievement to the current date.
    // To fix these, any achievements for these metrics that were previously -1, are set to an "unknown" date.
    const metricsToSkip = [Metric.ARTIO, Metric.CALVARION, Metric.SPINDEL, Metric.COLLECTIONS_LOGGED];

    let forceUnknownDate = false;

    if (previous[getMetricValueKey(metric)] === -1 && metricsToSkip.includes(metric)) {
      forceUnknownDate = true;
    }

    return {
      playerId,
      name,
      metric,
      threshold,
      createdAt: forceUnknownDate ? UNKNOWN_DATE : current.createdAt,
      accuracy: forceUnknownDate ? null : current.createdAt.getTime() - previous.createdAt.getTime()
    };
  });

  const achievementsToAdd = [...missingAchievements, ...newAchievements];

  if (achievementsToAdd.length === 0) {
    return;
  }

  // Add all missing/new achievements
  await prisma.achievement.createMany({ data: achievementsToAdd, skipDuplicates: true });

  onAchievementsCreated(achievementsToAdd);
}

export { syncPlayerAchievements };
