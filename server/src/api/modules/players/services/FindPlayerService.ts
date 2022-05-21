import { z } from 'zod';
import prisma, { modifyPlayers, Player, PrismaPlayer } from '../../../../prisma';
import { BadRequestError } from '../../../errors';
import { sanitize, standardize, validateUsername } from '../player.utils';

const inputSchema = z
  .object({
    id: z.number().positive().optional(),
    username: z.string().optional(),
    createIfNotFound: z.boolean().optional().default(false)
  })
  .refine(s => s.id || s.username, {
    message: 'Undefined id and username.'
  })
  .refine(s => !s.createIfNotFound || s.username, {
    message: 'Cannot create players without username'
  });

type FindPlayerParams = z.infer<typeof inputSchema>;
type FindPlayerResults = [player: Player | null, isNew: boolean];

async function findPlayer(payload: FindPlayerParams): Promise<FindPlayerResults> {
  const params = inputSchema.parse(payload);

  if (params.id) {
    const player = await prisma.player
      .findUnique({
        where: { id: params.id }
      })
      .then(modifyPlayer);

    return [player, false];
  }

  if (!params.username) return [null, false];

  const player = await prisma.player
    .findFirst({
      where: { username: standardize(params.username) }
    })
    .then(modifyPlayer);

  if (!player && params.createIfNotFound) {
    const newPlayer = await createPlayer(params.username);
    return [newPlayer, true];
  }

  return [player, false];
}

async function createPlayer(username: string): Promise<Player> {
  const cleanUsername = standardize(username);

  const validationError = validateUsername(cleanUsername);

  if (validationError) {
    throw new BadRequestError(`Validation error: ${validationError.message}`);
  }

  const newPlayer = await prisma.player
    .create({
      data: {
        username: cleanUsername,
        displayName: sanitize(username)
      }
    })
    .then(modifyPlayer);

  return newPlayer;
}

function modifyPlayer(player: PrismaPlayer): Player {
  return player ? modifyPlayers([player])[0] : null;
}

export { findPlayer };
