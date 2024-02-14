import { z } from 'zod';

import prisma from '../../../../prisma';
import { PlayerStatus } from '../../../../utils';
import { NotFoundError } from '../../../errors';
import { PlayerDetails } from '../player.types';
import { formatPlayerDetails, standardize } from '../player.utils';
import { findPlayerSnapshot } from '../../snapshots/services/FindPlayerSnapshotService';

const inputSchema = z
  .object({
    id: z.number().int().positive().optional(),
    username: z.string().optional()
  })
  .refine(s => s.id || s.username, {
    message: 'Undefined id and username.'
  });

type FetchPlayerParams = z.infer<typeof inputSchema>;

async function fetchPlayerDetails(payload: FetchPlayerParams): Promise<PlayerDetails> {
  const params = inputSchema.parse(payload);

  const player = await prisma.player.findFirst({
    where: params.id ? { id: params.id } : { username: standardize(params.username) },
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
