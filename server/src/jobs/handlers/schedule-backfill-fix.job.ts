import prisma from '../../prisma';
import { logger } from '../../services/logger.service';
import { redisClient } from '../../services/redis.service';
import { JobHandler } from '../types/job-handler.type';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

export const ScheduleBackfillFixJobHandler: JobHandler = {
  async execute(_, context) {
    const cursor = parseInt((await redisClient.get('backfill-fix-cursor')) ?? '0');

    const playerBatch = await prisma.player.findMany({
      select: {
        id: true,
        username: true
      },
      where: {
        id: {
          gt: cursor
        }
      },
      orderBy: {
        id: 'asc'
      },
      take: 1000
    });

    if (playerBatch.length === 0) {
      // Nothing to backfill, this backfill is done
      return;
    }

    logger.info(
      `Scheduling backfill fix for players with IDs from ${playerBatch[0].id} to ${playerBatch[playerBatch.length - 1].id}`
    );

    for (const player of playerBatch) {
      await context.jobManager.add(
        JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS,
        {
          username: player.username,
          forceRecalculate: true
        },
        {
          priority: JobPriority.LOW
        }
      );
    }

    await redisClient.set('backfill-fix-cursor', playerBatch[playerBatch.length - 1].id.toString());
  }
};
