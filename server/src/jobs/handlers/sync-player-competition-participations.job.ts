import prisma, { PrismaTypes } from '../../prisma';
import { JobHandler } from '../types/job-handler.type';

interface Payload {
  username: string;
  forceRecalculate?: boolean;
}

export const SyncPlayerCompetitionParticipationsJobHandler: JobHandler<Payload> = {
  options: {
    maxConcurrent: 4
  },

  generateUniqueJobId(payload) {
    return [payload.username, String(payload.forceRecalculate)].join('_');
  },

  async execute(payload) {
    const player = await prisma.player.findFirst({
      where: {
        username: payload.username
      }
    });

    if (player === null || player.latestSnapshotDate === null) {
      return;
    }

    const participations = await prisma.participation.findMany({
      where: {
        player: {
          username: payload.username
        },
        competition:
          payload.forceRecalculate === true
            ? undefined
            : {
                startsAt: { lte: player.latestSnapshotDate },
                endsAt: { gte: player.latestSnapshotDate }
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

    for (const participation of participations) {
      // Update this participation's latest (end) snapshot
      const updatePayload: PrismaTypes.ParticipationUncheckedUpdateInput = {
        endSnapshotDate: player.latestSnapshotDate
      };

      // If this participation's starting snapshot has not been set,
      // find the first snapshot within the competition period and set it
      if (participation.startSnapshotDate === null || payload.forceRecalculate === true) {
        const startSnapshot = await prisma.snapshot.findFirst({
          where: {
            playerId: player.id,
            createdAt: {
              gte: participation.competition.startsAt,
              lte: participation.competition.endsAt
            }
          },
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        });

        if (startSnapshot) {
          updatePayload.startSnapshotDate = startSnapshot.createdAt;
        }
      }

      if (payload.forceRecalculate === true) {
        // If force recalculating, search for the latest snapshot as well,
        // instead of relying on the player's latest snapshot
        const endSnapshot = await prisma.snapshot.findFirst({
          where: {
            playerId: player.id,
            createdAt: {
              lte: participation.competition.endsAt
            }
          },
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (endSnapshot) {
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
};
