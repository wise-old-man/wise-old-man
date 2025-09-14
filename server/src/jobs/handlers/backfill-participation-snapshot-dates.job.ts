import prisma from '../../prisma';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';
import { JobType } from '../types/job-type.enum';

export class BackfillParticipationSnapshotDatesJob extends Job<unknown> {
  static options: JobOptions = {
    backoff: 30_000,
    rateLimiter: { max: 1, duration: 5_000 }
  };

  async execute() {
    await prisma.$executeRaw`
      WITH "to_update" AS (
        SELECT pp."competitionId", pp."playerId", s."createdAt"
        FROM "participations" pp
        JOIN "snapshots" s ON pp."startSnapshotId" = s."id"
        WHERE pp."startSnapshotDate" IS NULL
          AND pp."startSnapshotId" IS NOT NULL
        LIMIT 100
      )
      UPDATE "participations" pp
      SET "startSnapshotDate" = to_update."createdAt"
      FROM to_update
      WHERE pp."competitionId" = to_update."competitionId"
      AND pp."playerId" = to_update."playerId"
    `;

    await prisma.$executeRaw`
      WITH "to_update" AS (
        SELECT pp."competitionId", pp."playerId", s."createdAt"
        FROM "participations" pp
        JOIN "snapshots" s ON pp."endSnapshotId" = s."id"
        WHERE pp."endSnapshotDate" IS NULL
          AND pp."endSnapshotId" IS NOT NULL
        LIMIT 100
      )
      UPDATE "participations" pp
      SET "endSnapshotDate" = to_update."createdAt"
      FROM to_update
      WHERE pp."competitionId" = to_update."competitionId"
      AND pp."playerId" = to_update."playerId"
    `;

    this.jobManager.add(JobType.BACKFILL_PARTICIPATION_SNAPSHOT_DATES, {});
  }
}
