import { z } from 'zod';
import { Period, PeriodProps } from '@wise-old-man/utils';
import prisma, { Snapshot } from '../../../../prisma';
import { RateLimitError } from '../../../errors';
import * as playerUtils from '../player.utils';
import * as snapshotService from '../../../services/internal/snapshot.service';
import * as cmlService from '../../../services/external/cml.service';

const YEAR_IN_SECONDS = PeriodProps[Period.YEAR].milliseconds / 1000;

const inputSchema = z.object({
  id: z.number().positive(),
  username: z.string(),
  lastImportedAt: z.date().or(z.null())
});

type ImportPlayerHistoryParams = z.infer<typeof inputSchema>;

async function importPlayerHistory(payload: ImportPlayerHistoryParams): Promise<Snapshot[]> {
  const params = inputSchema.parse(payload);

  const [shouldImport, secondsSinceImport] = playerUtils.shouldImport(params.lastImportedAt);

  // If the player has been imported in the last 24h
  if (!shouldImport) {
    const timeLeft = Math.floor((24 * 3600 - secondsSinceImport) / 60);
    throw new RateLimitError(`Imported too soon, please wait another ${timeLeft} minutes.`);
  }

  const importedSnapshots = [];

  // If the player hasn't imported in over a year import the last year and decade.
  if (secondsSinceImport >= YEAR_IN_SECONDS) {
    const yearSnapshots = await importCMLHistorySince(params.id, params.username, YEAR_IN_SECONDS);
    const decadeSnapshots = await importCMLHistorySince(params.id, params.username, YEAR_IN_SECONDS * 10);

    importedSnapshots.push(yearSnapshots);
    importedSnapshots.push(decadeSnapshots);
  } else {
    const recentSnapshots = await importCMLHistorySince(params.id, params.username, secondsSinceImport);
    importedSnapshots.push(recentSnapshots);
  }

  // Update the player's "last imported at" date
  await prisma.player.update({
    data: { lastImportedAt: new Date() },
    where: { id: params.id }
  });

  return importedSnapshots;
}

async function importCMLHistorySince(id: number, username: string, time: number): Promise<Snapshot[]> {
  // Load the CML history
  const history = await cmlService.getCMLHistory(username, time);

  // Convert the CML csv data to Snapshot instances
  const snapshots = await Promise.all(history.map(row => snapshotService.legacy_fromCML(id, row)));

  // Ignore any CML snapshots past May 10th 2020 (when we introduced boss tracking)
  const pastSnapshots = snapshots.filter((s: any) => s.createdAt < new Date('2020-05-10'));

  // Save new snapshots to db
  const savedSnapshots = await snapshotService.saveAll(pastSnapshots);

  return savedSnapshots;
}

export { importPlayerHistory };
