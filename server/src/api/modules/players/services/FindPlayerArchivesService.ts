import { z } from 'zod';
import prisma from '../../../../prisma';
import { NotFoundError } from '../../../errors';
import { standardize } from '../player.utils';
import { PlayerArchiveWithPlayer } from '../player.types';

const inputSchema = z.object({
  username: z.string()
});

type FindPlayerArchivesParams = z.infer<typeof inputSchema>;

async function findPlayerArchives(payload: FindPlayerArchivesParams) {
  const params = inputSchema.parse(payload);

  const archives = await prisma.playerArchive.findMany({
    where: {
      previousUsername: standardize(params.username),
      restoredAt: null
    },
    include: {
      player: true
    },
    orderBy: { createdAt: 'desc' }
  });

  if (archives.length === 0) {
    const player = await prisma.player.findFirst({
      where: {
        username: standardize(params.username)
      }
    });

    if (!player) {
      throw new NotFoundError('Player not found.');
    }
  }

  return archives as PlayerArchiveWithPlayer[];
}

export { findPlayerArchives };
