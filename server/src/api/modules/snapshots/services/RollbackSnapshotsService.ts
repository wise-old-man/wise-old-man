import { AsyncResult, complete, errored, fromPromise, isErrored } from '@attio/fetchable';
import { jobManager, JobType } from '../../../../jobs';
import prisma from '../../../../prisma';

export async function rollbackSnapshots(
  playerId: number,
  deleteAllSince?: Date
): AsyncResult<
  true,
  { code: 'FAILED_TO_ROLLBACK_SNAPSHOTS'; subError: unknown } | { code: 'NO_SNAPSHOTS_TO_DELETE' }
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

      const snapshotDatesToDelete = snapshotsToDelete.map(s => s.createdAt);

      await transaction.participation.updateMany({
        where: {
          playerId,
          OR: [
            { startSnapshotDate: { in: snapshotDatesToDelete } },
            { endSnapshotDate: { in: snapshotDatesToDelete } }
          ]
        },
        data: {
          startSnapshotDate: null,
          endSnapshotDate: null
        }
      });

      await transaction.snapshot.deleteMany({
        where: {
          playerId,
          createdAt: {
            in: snapshotDatesToDelete
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
    return errored({ code: 'NO_SNAPSHOTS_TO_DELETE' });
  }

  const player = await prisma.player.findFirst({
    where: {
      id: playerId
    },
    select: {
      username: true
    }
  });

  if (player !== null) {
    jobManager.add(JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS, {
      username: player.username,
      forceRecalculate: true
    });
  }

  return complete(true);
}
