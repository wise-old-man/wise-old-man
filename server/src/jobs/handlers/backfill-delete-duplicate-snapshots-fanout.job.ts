import prisma from '../../prisma';
import { sleep } from '../../utils/sleep.util';
import { Job } from '../job.class';
import { JobType } from '../types/job-type.enum';

export class BackfillDeleteDuplicateSnapshotsFanoutJob extends Job<unknown> {
  async execute() {
    const playerIds = await prisma.$queryRaw<{ playerId: number }[]>`
      SELECT distinct("playerId") FROM public.failed_pairs_2;
    `;

    for (const { playerId } of playerIds) {
      this.jobManager.add(JobType.BACKFILL_DELETE_DUPLICATE_SNAPSHOTS, { playerId });
      await sleep(10);
    }
  }
}
