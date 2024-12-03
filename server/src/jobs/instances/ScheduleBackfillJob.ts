import prisma from '../../prisma';
import { Job } from '../job.utils';

export class ScheduleBackfillJob extends Job<unknown> {
  async execute() {
    // Not the most efficient query, but it's fine for leagues
    const randomUnbackfilledPlayers = await prisma.$queryRaw<Array<{ id: number }>>`
        SELECT * FROM public.players WHERE "id" NOT IN (
	        SELECT "playerId" FROM public.snapshots WHERE "createdAt" = '2024-11-27T15:15:00.000Z'
        )
        ORDER BY RANDOM()
        LIMIT 1000
    `;

    randomUnbackfilledPlayers.map(player => {
      this.jobManager.add('InitialDataBackfillJob', { playerId: player.id });
    });

    const invalidatedCompetitions = await prisma.$queryRaw<Array<{ competitionId: number }>>`
      SELECT DISTINCT("competitionId") FROM public.participations
      WHERE "startSnapshotId" IS NULL AND "endSnapshotId" IS NOT NULL
    `;

    invalidatedCompetitions.map(competition => {
      this.jobManager.add('RecalculateBackfillCompetitionJob', { competitionId: competition.competitionId });
    });
  }
}
