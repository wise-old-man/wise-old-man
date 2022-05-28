import { z } from 'zod';
import { Period, PeriodProps } from '../../../../utils/periods';
import prisma from '../../../../prisma';
import { RateLimitError } from '../../../errors';
import * as playerUtils from '../player.utils';
import * as cmlService from '../../../services/external/cml.service';
import * as snapshotServices from '../../snapshots/snapshot.services';
import { SnapshotDataSource, SnapshotFragment } from '../../snapshots/snapshot.types';

const YEAR_IN_SECONDS = PeriodProps[Period.YEAR].milliseconds / 1000;

const inputSchema = z.object({
  id: z.number().positive(),
  username: z.string(),
  lastImportedAt: z.date().or(z.null())
});

type ImportPlayerHistoryParams = z.infer<typeof inputSchema>;

async function importPlayerHistory(payload: ImportPlayerHistoryParams): Promise<{ count: number }> {
  const params = inputSchema.parse(payload);

  const [shouldImport, secondsSinceImport] = playerUtils.shouldImport(params.lastImportedAt);

  // If the player has been imported in the last 24h
  if (!shouldImport) {
    const timeLeft = Math.floor((24 * 3600 - secondsSinceImport) / 60);
    throw new RateLimitError(`Imported too soon, please wait another ${timeLeft} minutes.`);
  }

  let importedCount = 0;

  // If the player hasn't imported in over a year import the last year and decade.
  if (secondsSinceImport >= YEAR_IN_SECONDS) {
    const yearSnapshots = await importCMLHistorySince(params.id, params.username, YEAR_IN_SECONDS);
    const decadeSnapshots = await importCMLHistorySince(params.id, params.username, YEAR_IN_SECONDS * 10);

    importedCount += yearSnapshots.count;
    importedCount += decadeSnapshots.count;
  } else {
    const recentSnapshots = await importCMLHistorySince(params.id, params.username, secondsSinceImport);

    importedCount = recentSnapshots.count;
  }

  // Update the player's "last imported at" date
  await prisma.player.update({
    data: { lastImportedAt: new Date() },
    where: { id: params.id }
  });

  return { count: importedCount };
}

async function importCMLHistorySince(id: number, username: string, time: number): Promise<{ count: number }> {
  // Load the CML history
  const history = await cmlService.getCMLHistory(username, time);

  // Convert the CML csv data to Snapshot instances
  const snapshots = await Promise.all(
    history.map(row =>
      snapshotServices.buildSnapshot({
        playerId: id,
        rawCSV: row,
        source: SnapshotDataSource.CRYSTAL_MATH_LABS
      })
    )
  );

  // Ignore any CML snapshots past May 10th 2020 (when we introduced boss tracking)
  const pastSnapshots = snapshots.filter((s: any) => s.createdAt < new Date('2020-05-10'));

  // Save new snapshots to db, return the number of created rows
  const result = await saveAllSnapshots(pastSnapshots);

  return result;
}

async function saveAllSnapshots(inputs: SnapshotFragment[]): Promise<{ count: number }> {
  if (inputs.length === 0) {
    return { count: 0 };
  }

  const existingSnapshots = await prisma.snapshot.findMany({
    where: { playerId: inputs[0].playerId }
  });

  const existingVals = existingSnapshots.map(({ playerId, createdAt }) => {
    return JSON.stringify({ playerId, timestamp: createdAt.getTime() });
  });

  // Filter out any repeated snapshots
  const newVals = inputs.filter(({ playerId, createdAt }) => {
    return !existingVals.includes(JSON.stringify({ playerId, timestamp: (createdAt as Date).getTime() }));
  });

  if (!newVals || !newVals.length) {
    return { count: 0 };
  }

  const { count } = await prisma.snapshot.createMany({
    data: newVals
  });

  return { count };
}

export { importPlayerHistory, saveAllSnapshots };
