import prisma from '../../prisma';
import { JobHandler } from '../types/job-handler.type';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

const LEAGUE_START_TIME = new Date(`2026-04-15T10:30:00.000Z`);

interface Payload {
  username: string;
}

export const BackfillInitialSnapshotJobHandler: JobHandler<Payload> = {
  async execute(payload, context) {
    const player = await prisma.player.findFirst({
      where: {
        username: payload.username
      }
    });

    if (player === null) {
      // Player doesn't exist, skip
      return;
    }

    const existing = await prisma.snapshot.findFirst({
      where: {
        playerId: player.id,
        createdAt: LEAGUE_START_TIME
      }
    });

    if (existing !== null) {
      // Already backfilled
      return;
    }

    await prisma.snapshot.create({
      data: {
        playerId: player.id,
        createdAt: LEAGUE_START_TIME,
        runecraftingExperience: 388,
        herbloreExperience: 174,
        hitpointsExperience: 1154,
        overallExperience: 1716
      }
    });

    await context.jobManager.add(
      JobType.SYNC_PLAYER_COMPETITION_PARTICIPATIONS,
      {
        username: payload.username,
        forceRecalculate: true
      },
      {
        priority: JobPriority.LOW
      }
    );
  }
};
