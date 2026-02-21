import prisma from '../../../../prisma';
import { Player, PlayerAnnotationType } from '../../../../types';
import { optOutFilter } from '../../../../utils/shared/player-annotation.utils';
import { PaginationOptions } from '../../../util/validation';

async function searchPlayers(username: string, pagination: PaginationOptions): Promise<Player[]> {
  const players = await prisma.player.findMany({
    where: {
      username: { startsWith: username.trim(), mode: 'insensitive' },
      ...optOutFilter(PlayerAnnotationType.OPT_OUT)
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
