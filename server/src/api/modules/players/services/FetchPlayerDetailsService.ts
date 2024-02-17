import prisma from '../../../../prisma';
import { PlayerStatus } from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { PlayerDetails } from '../player.types';
import { formatPlayerDetails, standardize } from '../player.utils';
import { findPlayerSnapshot } from '../../snapshots/services/FindPlayerSnapshotService';

async function fetchPlayerDetails(username: string): Promise<PlayerDetails> {
  const player = await prisma.player.findFirst({
    where: { username: standardize(username) },
    include: { latestSnapshot: true }
  });

  if (!player) {
    throw new NotFoundError('Player not found.');
  }

  if (!player.latestSnapshot) {
    // If this player's "latestSnapshotId" isn't populated, fetch the latest snapshot from the DB
    const latestSnapshot = await findPlayerSnapshot({ id: player.id });
    if (latestSnapshot) player.latestSnapshot = latestSnapshot;
  }

  if (player.status !== PlayerStatus.ARCHIVED) {
    return formatPlayerDetails(player, player.latestSnapshot);
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

  return formatPlayerDetails(player, player.latestSnapshot, currentArchive);
}

export { fetchPlayerDetails };
