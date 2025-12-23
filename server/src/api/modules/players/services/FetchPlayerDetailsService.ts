import { AsyncResult, complete, errored } from '@attio/fetchable';
import prisma from '../../../../prisma';
import { Player, PlayerAnnotation, PlayerArchive, PlayerStatus, Snapshot } from '../../../../types';
import { standardize } from '../player.utils';

type PlayerDetails = {
  player: Player;
  latestSnapshot: Snapshot | null;
  archive: PlayerArchive | null;
  annotations: Array<PlayerAnnotation>;
};

async function fetchPlayerDetails(
  username: string
): AsyncResult<PlayerDetails, { code: 'PLAYER_NOT_FOUND' }> {
  const player = await prisma.player.findFirst({
    where: { username: standardize(username) },
    include: { latestSnapshot: true, annotations: true }
  });

  if (!player) {
    return errored({ code: 'PLAYER_NOT_FOUND' });
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

  let currentArchive: PlayerArchive | null = null;

  if (player.status === PlayerStatus.ARCHIVED) {
    currentArchive = await prisma.playerArchive.findFirst({
      where: {
        playerId: player.id,
        restoredAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  const { annotations, latestSnapshot, ...playerProps } = player;

  return complete({
    player: playerProps,
    annotations,
    latestSnapshot,
    archive: currentArchive
  });
}

export { fetchPlayerDetails };
