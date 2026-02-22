import prisma from '../../../../prisma';
import { Player, PlayerAnnotationType } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

async function searchPlayers(username: string, pagination: PaginationOptions): Promise<Player[]> {
  const players = await prisma.player.findMany({
    where: {
      username: { startsWith: username.trim(), mode: 'insensitive' },
      annotations: {
        none: {
          type: PlayerAnnotationType.OPT_OUT
        }
      }
    },
    orderBy: {
      ehp: 'desc'
    },
    take: pagination.limit,
    skip: pagination.offset
  });

  return players;
}

export { searchPlayers };
