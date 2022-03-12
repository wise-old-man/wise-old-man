import { z } from 'zod';
import prisma, { modifyAchievements } from '../../../../prisma';
import * as snapshotService from '../../../services/internal/snapshot.service';
import { calculatePastDates, getAchievementDefinitions } from '../achievement.utils';

const ALL_DEFINITIONS = getAchievementDefinitions();
const UNKNOWN_DATE = new Date(0);

const schema = z.object({
  playerId: z.number().int().positive()
});

type SyncPlayerAchievementsParams = z.infer<typeof schema>;

class SyncPlayerAchievementsService {
  validate(payload: any): SyncPlayerAchievementsParams {
    return schema.parse(payload);
  }

  async execute(params: SyncPlayerAchievementsParams): Promise<void> {
    // Fetch the player's latest 2 snapshots
    const latestSnapshots = await snapshotService.findAll(params.playerId, 2);

    if (!latestSnapshots || latestSnapshots.length < 2) {
      return;
    }

    const [current, previous] = latestSnapshots;

    // Find all achievements the player already has
    const currentAchievements = await prisma.achievement
      .findMany({ where: { playerId: params.playerId } })
      .then(modifyAchievements);

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
    const allSnapshots = await snapshotService.findAll(params.playerId, 100_000);
    const missingPastDates = calculatePastDates(allSnapshots.reverse(), missingDefinitions);

    // Create achievement instances for all the missing definitions
    const missingAchievements = missingDefinitions.map(({ name, metric, threshold }) => {
      const date = missingPastDates[name] || UNKNOWN_DATE;
      return { playerId: params.playerId, name, metric, threshold, createdAt: date };
    });

    // Create achievement instances for all the newly achieved definitions
    const newAchievements = newDefinitions.map(({ name, metric, threshold }) => {
      return { playerId: params.playerId, name, metric, threshold, createdAt: current.createdAt };
    });

    // Add all missing/new achievements
    await prisma.achievement.createMany({
      data: [...missingAchievements, ...newAchievements],
      skipDuplicates: true
    });
  }
}

export default new SyncPlayerAchievementsService();
