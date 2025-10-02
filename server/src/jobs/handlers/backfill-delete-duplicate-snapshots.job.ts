import prisma from '../../prisma';
import logger from '../../services/logging.service';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

interface Payload {
  playerId: number;
}

export class BackfillDeleteDuplicateSnapshotsJob extends Job<Payload> {
  static options: JobOptions = {
    backoff: 30_000,
    rateLimiter: { max: 1, duration: 200 }
  };

  static getUniqueJobId(payload: Payload) {
    return payload.playerId.toString();
  }

  async execute(payload: Payload) {
    const allSnapshots = await prisma.snapshot.findMany({
      where: {
        playerId: payload.playerId
      },
      select: {
        id: true,
        createdAt: true
      }
    });

    const map = new Map<number, number[]>();

    for (const { id, createdAt } of allSnapshots) {
      const timestamp = createdAt.getTime();
      if (map.has(timestamp)) {
        map.get(timestamp)!.push(id);
      } else {
        map.set(timestamp, [id]);
      }
    }

    const idsToDelete = Array.from(map.values()).flatMap(ids => {
      if (ids.length < 2) return [];
      return ids.slice(1);
    });

    const result = await prisma.$transaction(async transaction => {
      // Unset player snapshot fks
      const updatedPlayer = await transaction.player.update({
        where: {
          id: payload.playerId
        },
        data: {
          latestSnapshotDate: null,
          latestSnapshotId: null
        }
      });

      // Unset participation fks
      const updatedParticipationsResult = await transaction.participation.updateMany({
        where: {
          playerId: payload.playerId
        },
        data: {
          startSnapshotId: null,
          startSnapshotDate: null,
          endSnapshotId: null,
          endSnapshotDate: null
        }
      });

      const deletedSnapshotsResult = await transaction.snapshot.deleteMany({
        where: {
          id: { in: idsToDelete }
        }
      });

      return {
        updatedPlayer,
        updatedParticipationsResult,
        deletedSnapshotsResult
      };
    });

    const { updatedPlayer, updatedParticipationsResult, deletedSnapshotsResult } = result;

    logger.debug('Backfilling duplicate snapshots for player', {
      playerId: payload.playerId,
      username: updatedPlayer.username,
      idsToDelete,
      deletedSnapshotsCount: deletedSnapshotsResult.count,
      updatedParticipationsCount: updatedParticipationsResult.count
    });

    this.jobManager.add(
      JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS,
      { username: updatedPlayer.username, forceRecalculate: true },
      { priority: JobPriority.HIGH }
    );

    this.jobManager.add(
      JobType.UPDATE_PLAYER,
      { username: updatedPlayer.username },
      { priority: JobPriority.HIGH }
    );
  }
}
