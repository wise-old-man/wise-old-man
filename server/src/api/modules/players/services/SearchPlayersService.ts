import { z } from 'zod';
import prisma, { modifyPlayers, Player } from '../../../../prisma';
import { PAGINATION_SCHEMA } from '../../../util/validation';

const inputSchema = z
  .object({
    username: z.string().nonempty({ message: "Parameter 'username' is undefined." })
  })
  .merge(PAGINATION_SCHEMA);

type SearchPlayersParams = z.infer<typeof inputSchema>;

async function searchPlayers(payload: SearchPlayersParams): Promise<Player[]> {
  const params = inputSchema.parse(payload);

  const players = await prisma.player
    .findMany({
      where: {
        username: { startsWith: params.username, mode: 'insensitive' }
      },
      orderBy: {
        ehp: 'desc'
      },
      take: params.limit,
      skip: params.offset
    })
    .then(modifyPlayers);

  return players;
}

export { searchPlayers };
