import prisma from '../../prisma';
import logger from '../../services/logging.service';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  playerId: number;
}

export class BackfillDeleteDuplicateSnapshotsJob extends Job<Payload> {
  static options: JobOptions = {
    backoff: 30_000,
    rateLimiter: { max: 1, duration: 5_000 }
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

    logger.debug('Backfilling duplicate snapshots for player', {
      playerId: payload.playerId,
      idsToDelete,
      map: Array.from(map.entries())
    });
  }
}
