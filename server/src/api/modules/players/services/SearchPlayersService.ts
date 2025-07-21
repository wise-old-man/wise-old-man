import prisma from '../../../../prisma';
import { Player } from '../../../../types';
import { PaginationOptions } from '../../../util/validation';

async function searchPlayers(username: string, pagination: PaginationOptions): Promise<Player[]> {
  const players = await prisma.player.findMany({
    where: {
      username: { startsWith: username.trim(), mode: 'insensitive' }
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
