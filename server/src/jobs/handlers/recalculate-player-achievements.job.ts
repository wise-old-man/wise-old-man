import { eventEmitter, EventType } from '../../api/events';
import {
  calculatePastDates,
  getAchievementDefinitions
} from '../../api/modules/achievements/achievement.utils';
import { findPlayerSnapshots } from '../../api/modules/snapshots/services/FindPlayerSnapshotsService';
import prisma from '../../prisma';
import { Job } from '../job.class';

interface Payload {
  username: string;
}

export class RecalculatePlayerAchievementsJob extends Job<Payload> {
  static getUniqueJobId(payload: Payload) {
    return payload.username;
  }

  async execute(payload: Payload) {
    const ALL_DEFINITIONS = getAchievementDefinitions();
    const UNKNOWN_DATE = new Date(0);

    const player = await prisma.player.findFirst({
      where: {
        username: payload.username
      }
    });

    if (player === null) {
      return;
    }

    // Find all unknown date achievements
    const unknownAchievements = await prisma.achievement.findMany({
      where: {
        playerId: player.id,
        createdAt: UNKNOWN_DATE
      }
    });

    const unknownAchievementNames = unknownAchievements.map(u => u.name);
    const unknownDefinitions = ALL_DEFINITIONS.filter(d => unknownAchievementNames.includes(d.name));

    // Search dates for previously unknown definitions, based on player history
    const allSnapshots = await findPlayerSnapshots(player.id);
    const pastDatesData = calculatePastDates(allSnapshots.reverse(), unknownDefinitions);

    // Attach new dates where possible, and filter out any (still) unknown achievements
    const toUpdate = unknownAchievements
      .map(a => {
        const unknownAchievementData = pastDatesData[a.name];

        return {
          ...a,
          accuracy: unknownAchievementData?.accuracy || null,
          createdAt: unknownAchievementData?.date || UNKNOWN_DATE
        };
      })
      .filter(a => a.createdAt.getTime() > 0);

    if (!toUpdate || toUpdate.length === 0) return;

    await prisma.$transaction([
      // Delete outdated achievements
      prisma.achievement.deleteMany({
        where: {
          playerId: player.id,
          name: { in: toUpdate.map(t => t.name) }
        }
      }),

      // Re-add them with the correct date
      prisma.achievement.createMany({
        data: toUpdate,
        skipDuplicates: true
      })
    ]);

    eventEmitter.emit(EventType.PLAYER_ACHIEVEMENTS_CREATED, {
      username: player.username,
      achievements: toUpdate.map(({ metric, threshold }) => ({
        metric,
        threshold
      }))
    });
  }
}
