import prisma from '../../prisma';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';
import { JobType } from '../types/job-type.enum';

export class BackfillPlayerSnapshotDatesJob extends Job<unknown> {
  static options: JobOptions = {
    backoff: 30_000,
    rateLimiter: { max: 1, duration: 10_000 }
  };

  async execute() {
    await prisma.$executeRaw`
      WITH "to_update" AS (
        SELECT p."id" as "playerId", s."createdAt"
        FROM "players" p
        JOIN "snapshots" s ON p."latestSnapshotId" = s."id"
        WHERE p."latestSnapshotDate" IS NULL
          AND p."latestSnapshotId" IS NOT NULL
        LIMIT 100
      )
      UPDATE "players" p
      SET "latestSnapshotDate" = to_update."createdAt"
      FROM to_update
      WHERE p."id" = to_update."playerId"
    `;

    this.jobManager.add(JobType.BACKFILL_PLAYER_SNAPSHOT_DATES, {});
  }
}
