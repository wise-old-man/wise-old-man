import { z } from 'zod';
import prisma, { modifyAchievements } from '../../../../prisma';
import * as snapshotService from '../../../services/internal/snapshot.service';
import { calculatePastDates, getAchievementDefinitions } from '../achievement.utils';

const ALL_DEFINITIONS = getAchievementDefinitions();
const UNKNOWN_DATE = new Date(0);

const schema = z.object({
  playerId: z.number().int().positive()
});

type ReevaluatePlayerAchievementsParams = z.infer<typeof schema>;

class ReevaluatePlayerAchievementsService {
  validate(payload: any): ReevaluatePlayerAchievementsParams {
    return schema.parse(payload);
  }

  async execute(params: ReevaluatePlayerAchievementsParams): Promise<void> {
    // Find all unknown date achievements
    const unknownAchievements = await prisma.achievement
      .findMany({ where: { playerId: params.playerId, createdAt: UNKNOWN_DATE } })
      .then(modifyAchievements);

    const unknownAchievementNames = unknownAchievements.map(u => u.name);
    const unknownDefinitions = ALL_DEFINITIONS.filter(d => unknownAchievementNames.includes(d.name));

    // Search dates for previously unknown definitions, based on player history
    const allSnapshots = await snapshotService.findAll(params.playerId, 100_000);
    const pastDates = calculatePastDates(allSnapshots.reverse(), unknownDefinitions);

    // Attach new dates where possible, and filter out any (still) unknown achievements
    const toUpdate = unknownAchievements
      .map(a => ({ ...a, createdAt: pastDates[a.name] || UNKNOWN_DATE }))
      .filter(a => a.createdAt.getTime() > 0);

    if (!toUpdate || toUpdate.length === 0) return;

    // Start a database transaction, to make sure that if the "create" step fails,
    // it'll rollback the "delete" step as well.
    await prisma.$transaction([
      // Delete outdated achievements
      prisma.achievement.deleteMany({
        where: {
          playerId: params.playerId,
          name: { in: toUpdate.map(t => t.name) }
        }
      }),

      // Re-add them with the correct date
      prisma.achievement.createMany({
        data: toUpdate,
        skipDuplicates: true
      })
    ]);
  }
}

export default new ReevaluatePlayerAchievementsService();
