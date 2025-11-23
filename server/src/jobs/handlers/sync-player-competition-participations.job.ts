import prisma, { PrismaTypes } from '../../prisma';
import { Job } from '../job.class';
import { JobOptions } from '../types/job-options.type';
import { JobPriority } from '../types/job-priority.enum';

interface Payload {
  username: string;
  forceRecalculate?: boolean;
}

export class SyncPlayerCompetitionParticipationsJob extends Job<Payload> {
  static options: JobOptions = {
    maxConcurrent: 4
  };

  static getUniqueJobId(payload: Payload) {
    return [payload.username, String(payload.forceRecalculate)].join('_');
  }

  async execute(payload: Payload) {
    if (this.bullJob?.opts.priority === JobPriority.HIGH && payload.forceRecalculate === true) {
      // Temporary, to drain out all the high priority (slow) jobs first
      return;
    }

    const now = new Date();

    // Get all on-going competitions (and participations)
    const participations = await prisma.participation.findMany({
      where: {
        player: {
          username: payload.username
        },
        competition:
          payload.forceRecalculate === true
            ? undefined
            : {
                startsAt: { lt: now },
                endsAt: { gt: now }
              }
      },
      include: {
        competition: true
      }
    });

    // No ongoing competitions, nothing to update
    if (!participations || participations.length === 0) {
      return;
    }

    const player = await prisma.player.findFirst({
      where: {
        username: payload.username
      }
    });

    if (player === null || player.latestSnapshotId === null) {
      return;
    }

    for (const participation of participations) {
      // Update this participation's latest (end) snapshot
      const updatePayload: PrismaTypes.ParticipationUncheckedUpdateInput = {
        endSnapshotId: player.latestSnapshotId,
        endSnapshotDate: player.latestSnapshotDate
      };

      // If this participation's starting snapshot has not been set,
      // find the first snapshot created since the start date and set it
      if (!participation.startSnapshotId || payload.forceRecalculate === true) {
        const startSnapshot = await prisma.snapshot.findFirst({
          where: {
            playerId: player.id,
            createdAt: { gte: participation.competition.startsAt }
          },
          select: {
            id: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (startSnapshot) {
          updatePayload.startSnapshotId = startSnapshot.id;
          updatePayload.startSnapshotDate = startSnapshot.createdAt;
        }
      }

      if (payload.forceRecalculate === true) {
        // If force recalculating, search for the latest snapshot as well,
        // instead of relying on the player's latest snapshot
        const endSnapshot = await prisma.snapshot.findFirst({
          where: {
            playerId: player.id,
            createdAt: { lte: participation.competition.endsAt }
          },
          select: {
            id: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (endSnapshot) {
          updatePayload.endSnapshotId = endSnapshot.id;
          updatePayload.endSnapshotDate = endSnapshot.createdAt;
        }
      }

      await prisma.participation.update({
        where: {
          playerId_competitionId: {
            playerId: player.id,
            competitionId: participation.competitionId
          }
        },
        data: updatePayload
      });
    }
  }
}
