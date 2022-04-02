import { z } from 'zod';
import prisma, { modifyAchievements } from '../../../../prisma';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { calculatePastDates, getAchievementDefinitions } from '../achievement.utils';

const ALL_DEFINITIONS = getAchievementDefinitions();
const UNKNOWN_DATE = new Date(0);

const inputSchema = z.object({
  id: z.number().int().positive()
});

type SyncPlayerAchievementsParams = z.infer<typeof inputSchema>;

async function syncPlayerAchievements(payload: SyncPlayerAchievementsParams): Promise<void> {
  const params = inputSchema.parse(payload);

  // Fetch the player's latest 2 snapshots
  const latestSnapshots = await snapshotServices.findPlayerSnapshots({ id: params.id, limit: 2 });

  if (!latestSnapshots || latestSnapshots.length < 2) {
    return;
  }

  const [current, previous] = latestSnapshots;

  // Find all achievements the player already has
  const currentAchievements = await prisma.achievement
    .findMany({ where: { playerId: params.id } })
    .then(modifyAchievements);

  // Find any missing achievements (by comparing the SHOULD HAVE with the HAS IN DATABASE lists)
  const missingDefinitions = ALL_DEFINITIONS.filter(d => {
    return d.validate(previous as any) && !currentAchievements.find(e => e.name === d.name);
  });

  // Find any new achievements (only achieved since the last snapshot)
  const newDefinitions = ALL_DEFINITIONS.filter(d => {
    return !d.validate(previous as any) && d.validate(current as any);
  });

  // Nothing to add.
  if (newDefinitions.length === 0 && missingDefinitions.length === 0) {
    return;
  }

  // Search dates for missing definitions, based on player history
  const allSnapshots = await snapshotServices.findPlayerSnapshots({ id: params.id });

  const missingPastDates = calculatePastDates(allSnapshots.reverse() as any, missingDefinitions);

  // Create achievement instances for all the missing definitions
  const missingAchievements = missingDefinitions.map(({ name, metric, threshold }) => {
    const date = missingPastDates[name] || UNKNOWN_DATE;
    return { playerId: params.id, name, metric, threshold, createdAt: date };
  });

  // Create achievement instances for all the newly achieved definitions
  const newAchievements = newDefinitions.map(({ name, metric, threshold }) => {
    return { playerId: params.id, name, metric, threshold, createdAt: current.createdAt };
  });

  // Add all missing/new achievements
  await prisma.achievement.createMany({
    data: [...missingAchievements, ...newAchievements],
    skipDuplicates: true
  });
}

export { syncPlayerAchievements };
