import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import prisma from '../../../../prisma';

export async function rollbackSnapshots(
  playerId: number,
  deleteAllSince?: Date
): AsyncResult<
  true,
  { code: 'FAILED_TO_ROLLBACK_SNAPSHOTS'; subError: unknown } | { code: 'NO_SNAPSHOTS_DELETED' }
> {
  const transactionResult = await fromPromise(
    prisma.$transaction(async transaction => {
      await transaction.player.update({
        where: {
          id: playerId
        },
        data: {
          latestSnapshotDate: null
        }
      });

      // Find snapshots to delete (either all since a date or just the latest one)
      const snapshotsToDelete = deleteAllSince
        ? await transaction.snapshot.findMany({
            select: {
              createdAt: true
            },
            where: {
              playerId,
              createdAt: { gt: deleteAllSince }
            }
          })
        : await transaction.snapshot.findMany({
            select: {
              createdAt: true
            },
            where: {
              playerId
            },
            orderBy: {
              createdAt: 'desc'
            },
            take: 1
          });

      if (snapshotsToDelete.length === 0) {
        return 0;
      }

      await transaction.snapshot.deleteMany({
        where: {
          playerId,
          createdAt: {
            in: snapshotsToDelete.map(s => s.createdAt)
          }
        }
      });

      const latestSnapshot = await transaction.snapshot.findFirst({
        select: {
          createdAt: true
        },
        where: {
          playerId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      if (latestSnapshot !== null) {
        await transaction.player.update({
          where: {
            id: playerId
          },
          data: {
            latestSnapshotDate: latestSnapshot.createdAt
          }
        });
      }

      return snapshotsToDelete.length;
    })
  );

  if (isErrored(transactionResult)) {
    return errored({
      code: 'FAILED_TO_ROLLBACK_SNAPSHOTS',
      subError: transactionResult.error
    });
  }

  if (transactionResult.value === 0) {
    return errored({ code: 'NO_SNAPSHOTS_DELETED' });
  }

  return complete(true);
}
