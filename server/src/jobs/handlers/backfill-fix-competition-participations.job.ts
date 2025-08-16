import prisma from '../../prisma';
import { chunkArray } from '../../utils/chunk-array.util';
import { Job } from '../job.class';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

export class BackfillFixCompetitionParticipationsJob extends Job<unknown> {
  async execute(): Promise<void> {
    if (process.env.NODE_ENV !== 'production') {
      return;
    }

    const possiblyAffectedUsernames = await prisma.$queryRaw<Array<{ username: string }>>`
        SELECT "username" FROM public.players
        WHERE "id" IN (
            SELECT DISTINCT("playerId") FROM public.participations
            WHERE "playerId" IN(
                SELECT DISTINCT("playerId") FROM public."nameChanges"
                WHERE "status" = 'approved'
            )
            AND "startSnapshotId" IS null
            AND "endSnapshotId" IS null
        )
    `;

    if (possiblyAffectedUsernames.length === 0) {
      return;
    }

    const chunks = chunkArray(possiblyAffectedUsernames, 5000);

    // This player first reported the bug, and I want their backfill to run first
    await this.jobManager.add(
      JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS,
      { username: 'todisgott' },
      { priority: JobPriority.HIGH }
    );

    for (const chunk of chunks) {
      await this.jobManager.addBulk(
        JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS,
        chunk.map(({ username }) => ({
          username,
          forceRecalculate: true
        })),
        {
          priority: JobPriority.LOW
        }
      );
    }
  }
}
