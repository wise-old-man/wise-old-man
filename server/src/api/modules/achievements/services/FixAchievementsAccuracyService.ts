import { z } from 'zod';
import prisma, { modifyAchievement } from '../../../../prisma';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { calculatePastAccuracy } from '../achievement.utils';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type FixAchievementsAccuracyParams = z.infer<typeof inputSchema>;

async function fixAchievementsAccuracy(payload: FixAchievementsAccuracyParams): Promise<void> {
  const params = inputSchema.parse(payload);

  // Find all achievements without a populated "accuracy"
  const missingAccuracy = await prisma.achievement
    .findMany({ where: { playerId: params.id, accuracy: null } })
    .then(a => a.map(modifyAchievement));

  if (missingAccuracy.length === 0) return;

  // Recalculate the player's "accuracy" field for each achievement, based on historical data
  const allSnapshots = await snapshotServices.findPlayerSnapshots({ id: params.id });
  const pastDatesData = calculatePastAccuracy(allSnapshots.reverse(), missingAccuracy);

  const toUpdate = missingAccuracy.map(a => {
    // If couldn't find an accuracy but HAS an achievement date, then it probably means this achievement date
    // is either wrong or was manually edited in the database, we can just set these to -2 and we'll evaluate them manually later
    return { ...a, accuracy: pastDatesData[a.name] || (a.createdAt.getTime() > 0 ? -2 : -1) };
  });

  // Start a database transaction, to make sure that if the "create" step fails,
  // it'll rollback the "delete" step as well.
  await prisma.$transaction([
    // Delete outdated achievements
    prisma.achievement.deleteMany({
      where: {
        playerId: params.id,
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

export { fixAchievementsAccuracy };
