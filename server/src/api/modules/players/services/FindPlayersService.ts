import { z } from 'zod';
import prisma, { modifyPlayer, Player } from '../../../../prisma';
import { sanitize, standardize } from '../player.utils';

const inputSchema = z
  .object({
    ids: z.number().positive().array().optional(),
    usernames: z.string().array().optional(),
    createIfNotFound: z.boolean().optional().default(false)
  })
  .refine(s => s.ids || s.usernames, {
    message: 'Undefined ids and usernames.'
  })
  .refine(s => !s.createIfNotFound || s.usernames, {
    message: 'Cannot create players without usernames'
  });

type FindPlayersParams = z.infer<typeof inputSchema>;

async function findPlayers(payload: FindPlayersParams): Promise<Player[]> {
  const params = inputSchema.parse(payload);

  if (params.usernames && params.usernames.length > 0) {
    if (params.createIfNotFound) {
      return await findOrCreatePlayersByUsername(params.usernames);
    } else {
      return await findPlayersByUsername(params.usernames);
    }
  }

  if (params.ids && params.ids.length > 0) {
    return await findPlayersById(params.ids);
  }

  return [];
}

async function findPlayersByUsername(usernames: string[]): Promise<Player[]> {
  const standardizedUsernames = usernames.map(standardize);

  const players = await prisma.player
    .findMany({
      where: { username: { in: standardizedUsernames } }
    })
    .then(p => p.map(modifyPlayer));

  return players.sort(
    (a, b) => standardizedUsernames.indexOf(a.username) - standardizedUsernames.indexOf(b.username)
  );
}

async function findOrCreatePlayersByUsername(usernames: string[]): Promise<Player[]> {
  const foundPlayers = await findPlayersByUsername(usernames);
  if (foundPlayers.length === usernames.length) return foundPlayers;

  // Find the already registered usernames
  const foundUsernames = foundPlayers.map(f => f.username);

  // Find the unregistered usernames
  const missingUsernames = usernames.filter(u => !foundUsernames.includes(standardize(u)));
  const newPlayerInputs = missingUsernames.map(m => ({ username: standardize(m), displayName: sanitize(m) }));

  // Add new players
  await prisma.player.createMany({ data: newPlayerInputs, skipDuplicates: true });

  const newPlayers = await prisma.player
    .findMany({
      where: { username: { in: newPlayerInputs.map(n => n.username) } }
    })
    .then(p => p.map(modifyPlayer));

  // Sort the resulting players list by the order of the input usernames
  const standardizedUsernames = usernames.map(standardize);

  return [...foundPlayers, ...newPlayers].sort(
    (a, b) => standardizedUsernames.indexOf(a.username) - standardizedUsernames.indexOf(b.username)
  );
}

async function findPlayersById(ids: number[]): Promise<Player[]> {
  const players = await prisma.player
    .findMany({
      where: { id: { in: ids } }
    })
    .then(p => p.map(modifyPlayer));

  return players;
}

export { findPlayers };
