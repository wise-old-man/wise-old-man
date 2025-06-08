import { Job } from '../job.class';
import prisma, { PrismaTypes } from '../../prisma';
import { JobOptions } from '../types/job-options.type';

interface Payload {
  username: string;
}

export class SyncPlayerCompetitionParticipationsJob extends Job<Payload> {
  static options: JobOptions = {
    maxConcurrent: 5
  };

  async execute(payload: Payload) {
    const now = new Date();

    // Get all on-going competitions (and participations)
    const participations = await prisma.participation.findMany({
      where: {
        player: {
          username: payload.username
        },
        competition: {
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

    const player = await prisma.player.findPreExtension({
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
        endSnapshotId: player.latestSnapshotId
      };

      // If this participation's starting snapshot has not been set,
      // find the first snapshot created since the start date and set it
      if (!participation.startSnapshotId) {
        const startSnapshot = await prisma.snapshot.findFirst({
          where: {
            playerId: player.id,
            createdAt: { gte: participation.competition.startsAt }
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (startSnapshot) {
          updatePayload.startSnapshotId = startSnapshot.id;
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
