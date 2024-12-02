import type { JobManager } from '../job.manager';
import { Job } from '../job.utils';
import prisma from '../../prisma';
import { LEAGUE_START_TIME } from '../../league';

type InitialDataBackfillJobPayload = {
  playerId: number;
};

export class InitialDataBackfillJob extends Job<InitialDataBackfillJobPayload> {
  constructor(jobManager: JobManager) {
    super(jobManager);
    this.options.rateLimiter = { max: 1, duration: 1000 };
  }

  async execute(payload: InitialDataBackfillJobPayload) {
    const { playerId } = payload;

    const existing = await prisma.snapshot.findFirst({
      where: {
        playerId,
        createdAt: LEAGUE_START_TIME
      }
    });

    if (existing !== null) {
      // Already backfilled
      return;
    }

    await prisma.snapshot.create({
      data: {
        playerId,
        createdAt: LEAGUE_START_TIME,
        runecraftingExperience: 388,
        herbloreExperience: 174,
        hitpointsExperience: 1154,
        overallExperience: 1716
      }
    });
  }
}
