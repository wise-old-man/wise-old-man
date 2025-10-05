import prisma from '../../prisma';
import { sleep } from '../../utils/sleep.util';
import { Job } from '../job.class';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

export class BackfillDeleteDuplicateSnapshotsFanoutJob extends Job<unknown> {
  async execute() {
    const playerIds = await prisma.$queryRaw<{ playerId: number }[]>`
      SELECT distinct("playerId") FROM public.failed_pairs_2;
    `;

    const usernames = await prisma.player.findMany({
      where: {
        id: {
          in: playerIds.map(({ playerId }) => playerId)
        }
      },
      select: {
        username: true
      }
    });

    for (const { username } of usernames) {
      await this.jobManager.add(
        JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS,
        {
          username,
          forceRecalculate: true
        },
        {
          priority: JobPriority.LOW,
          attempts: 20
        }
      );
      await sleep(10);
    }
  }
}
