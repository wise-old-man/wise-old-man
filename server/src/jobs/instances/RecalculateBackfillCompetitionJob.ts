import type { JobManager } from '../job.manager';
import { Job } from '../job.utils';
import prisma, { Snapshot } from '../../prisma';
import { findGroupSnapshots } from '../../api/modules/snapshots/services/FindGroupSnapshotsService';

type RecalculateBackfillCompetitionJobPayload = {
  competitionId: number;
};

export class RecalculateBackfillCompetitionJob extends Job<RecalculateBackfillCompetitionJobPayload> {
  constructor(jobManager: JobManager) {
    super(jobManager);
    this.options.rateLimiter = { max: 1, duration: 200 };
  }

  async execute(payload: RecalculateBackfillCompetitionJobPayload) {
    const { competitionId } = payload;

    const invalidParticipations = await prisma.participation.findMany({
      where: {
        competitionId,
        startSnapshotId: null
      }
    });

    if (invalidParticipations.length === 0) {
      return;
    }

    const competition = await prisma.competition.findFirst({
      where: {
        id: competitionId
      }
    });

    if (!competition) {
      return;
    }

    const playerIds = invalidParticipations.map(p => p.playerId);

    const playerSnapshots = await findGroupSnapshots(playerIds, {
      minDate: competition.startsAt
    });

    const snapshotMap = new Map<number, Snapshot>(playerSnapshots.map(s => [s.playerId, s]));

    for (const playerId of playerIds) {
      const snapshot = snapshotMap.get(playerId);

      if (!snapshot) {
        continue;
      }

      await prisma.participation.update({
        where: { playerId_competitionId: { competitionId, playerId } },
        data: { startSnapshotId: snapshot.id }
      });
    }
  }
}
