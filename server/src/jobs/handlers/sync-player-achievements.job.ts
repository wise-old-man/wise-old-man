import { eventEmitter, EventType } from '../../api/events';
import {
  calculatePastDates,
  getAchievementDefinitions
} from '../../api/modules/achievements/achievement.utils';
import { findPlayerSnapshots } from '../../api/modules/snapshots/services/FindPlayerSnapshotsService';
import { POST_RELEASE_HISCORE_ADDITIONS } from '../../api/modules/snapshots/snapshot.utils';
import prisma from '../../prisma';
import { getMetricValueKey } from '../../utils/get-metric-value-key.util';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

const ALL_DEFINITIONS = getAchievementDefinitions();
const UNKNOWN_DATE = new Date(0);

interface Payload {
  username: string;
  previousUpdatedAt: Date | null;
}

export class SyncPlayerAchievementsJob extends Job<Payload> {
  static options: JobOptions = {
    maxConcurrent: 4
  };

  static getUniqueJobId(payload: Payload) {
    return [payload.username, payload.previousUpdatedAt?.getTime()].join('_');
  }

  async execute(payload: Payload) {
    const playerAndSnapshot = await prisma.player.findFirst({
      where: {
        username: payload.username
      },
      include: {
        latestSnapshot: true
      }
    });

    const currentSnapshot = playerAndSnapshot?.latestSnapshot ?? null;

    if (playerAndSnapshot === null || currentSnapshot === null) {
      return;
    }

    const playerId = currentSnapshot.playerId;

    if (payload.previousUpdatedAt === null) {
      // If this is the first time player's being updated, find missing achievements and set them to "unknown" date
      const missingAchievements = ALL_DEFINITIONS.filter(d => d.validate(currentSnapshot)).map(
        ({ name, metric, threshold }) => ({
          playerId,
          name,
          metric,
          threshold,
          createdAt: UNKNOWN_DATE,
          accuracy: null
        })
      );

      if (missingAchievements.length === 0) {
        return;
      }

      // Add all missing achievements
      await prisma.achievement.createMany({
        data: missingAchievements,
        skipDuplicates: true
      });

      eventEmitter.emit(EventType.PLAYER_ACHIEVEMENTS_CREATED, {
        username: playerAndSnapshot?.username,
        achievements: missingAchievements.map(({ metric, threshold }) => ({
          metric,
          threshold
        }))
      });

      return;
    }

    const previousSnapshot = await prisma.snapshot.findFirst({
      where: {
        playerId,
        createdAt: payload.previousUpdatedAt
      }
    });

    if (previousSnapshot === null) {
      // This shouldn't really happen, that would mean that this snapshot was deleted
      // between the "PLAYER_UPDATED" event being emitted, and this job being executed
      return;
    }

    // Find all achievements the player already has
    const currentAchievements = await prisma.achievement.findMany({
      where: { playerId }
    });

    // Find any missing achievements (by comparing the SHOULD HAVE with the HAS IN DATABASE lists)
    const missingDefinitions = ALL_DEFINITIONS.filter(d => {
      return d.validate(previousSnapshot) && !currentAchievements.find(e => e.name === d.name);
    });

    // Find any new achievements (only achieved since the last snapshot)
    const newDefinitions = ALL_DEFINITIONS.filter(d => {
      return !d.validate(previousSnapshot) && d.validate(currentSnapshot);
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
      let forceUnknownDate = false;

      if (
        previousSnapshot[getMetricValueKey(metric)] === -1 &&
        POST_RELEASE_HISCORE_ADDITIONS.includes(metric)
      ) {
        forceUnknownDate = true;
      }

      return {
        playerId,
        name,
        metric,
        threshold,
        createdAt: forceUnknownDate ? UNKNOWN_DATE : currentSnapshot.createdAt,
        accuracy: forceUnknownDate
          ? null
          : currentSnapshot.createdAt.getTime() - previousSnapshot.createdAt.getTime()
      };
    });

    const achievementsToAdd = [...missingAchievements, ...newAchievements];

    if (achievementsToAdd.length === 0) {
      return;
    }

    // Add all missing/new achievements
    await prisma.achievement.createMany({
      data: achievementsToAdd,
      skipDuplicates: true
    });

    eventEmitter.emit(EventType.PLAYER_ACHIEVEMENTS_CREATED, {
      username: playerAndSnapshot?.username,
      achievements: achievementsToAdd.map(({ metric, threshold }) => ({
        metric,
        threshold
      }))
    });
  }
}
