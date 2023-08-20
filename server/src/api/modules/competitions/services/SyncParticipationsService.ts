import prisma, { PrismaTypes } from '../../../../prisma';
import * as snapshotServices from '../../snapshots/snapshot.services';

async function syncParticipations(playerId: number, latestSnapshotId: number): Promise<void> {
  const currentDate = new Date();

  // Get all on-going competitions (and participations)
  const participations = await prisma.participation.findMany({
    where: {
      playerId,
      competition: {
        startsAt: { lt: currentDate },
        endsAt: { gt: currentDate }
      }
    },
    include: {
      competition: true
    }
  });

  if (!participations || participations.length === 0) return;

  for (const participation of participations) {
    const updateFields: PrismaTypes.ParticipationUncheckedUpdateInput = {
      // Update this participation's latest (end) snapshot
      endSnapshotId: latestSnapshotId
    };

    // If this participation's starting snapshot has not been set,
    // find the first snapshot created since the start date and set it
    if (!participation.startSnapshotId) {
      const startSnapshot = await snapshotServices.findPlayerSnapshot({
        id: playerId,
        minDate: participation.competition.startsAt
      });

      updateFields.startSnapshotId = startSnapshot.id;
    }

    await prisma.participation.update({
      where: {
        playerId_competitionId: {
          playerId: playerId,
          competitionId: participation.competitionId
        }
      },
      data: { ...updateFields }
    });
  }
}

export { syncParticipations };
