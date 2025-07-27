import prisma from '../../../../prisma';
import { Player, PlayerAnnotation, PlayerArchive, PlayerStatus, Snapshot } from '../../../../types';
import { NotFoundError } from '../../../errors';
import { standardize } from '../player.utils';

async function fetchPlayerDetails(username: string): Promise<
  Player & {
    latestSnapshot: Snapshot | null;
    archive: PlayerArchive | null;
    annotations: Array<PlayerAnnotation>;
  }
> {
  const player = await prisma.player.findFirst({
    where: { username: standardize(username) },
    include: { latestSnapshot: true, annotations: true }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (!player.latestSnapshot) {
    // If this player's "latestSnapshotId" isn't populated, fetch the latest snapshot from the DB
    const latestSnapshot = await prisma.snapshot.findFirst({
      where: { playerId: player.id },
      orderBy: { createdAt: 'desc' }
    });

    if (latestSnapshot) {
      player.latestSnapshot = latestSnapshot;
    }
  }

  if (player.status !== PlayerStatus.ARCHIVED) {
    return { ...player, archive: null };
  }

  const currentArchive = await prisma.playerArchive.findFirst({
    where: {
      playerId: player.id,
      restoredAt: null
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return { ...player, archive: currentArchive };
}

export { fetchPlayerDetails };
