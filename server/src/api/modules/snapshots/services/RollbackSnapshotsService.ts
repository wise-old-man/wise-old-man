import prisma from '../../../../prisma';
import { ServerError } from '../../../errors';

async function rollbackSnapshots(playerId: number, deleteAllSince?: Date) {
  if (deleteAllSince) {
    await deleteSnapshotsSince(playerId, deleteAllSince);
  } else {
    await deleteLastSnapshot(playerId);
  }
}

async function deleteSnapshotsSince(playerId: number, date: Date) {
  // offset the date by 1 second to avoid deleting the snapshot at the exact same time
  const offsetDate = new Date(date.getTime() + 1000);

  const result = await prisma.$executeRaw`
    DELETE FROM public.snapshots
    WHERE "id" IN (
        SELECT "id" FROM public.snapshots
        WHERE "playerId" = ${playerId}
        AND "createdAt" > ${offsetDate}
  )`;

  if (result === 0) {
    throw new ServerError("Failed to delete a player's last snapshots.");
  }
}

async function deleteLastSnapshot(playerId: number) {
  const result = await prisma.$executeRaw`
    DELETE FROM public.snapshots
    WHERE "id" IN (
        SELECT "id" FROM public.snapshots
        WHERE "playerId" = ${playerId}
        ORDER BY "createdAt" DESC
        LIMIT 1
  )`;

  if (result !== 1) {
    throw new ServerError("Failed to delete a player's last snapshots.");
  }
}

export { rollbackSnapshots };
