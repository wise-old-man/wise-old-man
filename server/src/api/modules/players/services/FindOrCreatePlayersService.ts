import prisma, { Player } from '../../../../prisma';
import { sanitize, standardize } from '../player.utils';

async function findOrCreatePlayers(usernames: string[]): Promise<Player[]> {
  const foundPlayers = await prisma.player.findMany({
    where: { username: { in: usernames.map(standardize) } }
  });

  // If all players exist on the database already, great, just return them.
  if (foundPlayers.length === usernames.length) return foundPlayers;

  // Find the already registered usernames
  const foundUsernames = foundPlayers.map(f => f.username);

  // Find the unregistered usernames
  const missingUsernames = usernames.filter(u => !foundUsernames.includes(standardize(u)));

  const newPlayerInputs = missingUsernames.map(m => ({
    username: standardize(m),
    displayName: sanitize(m)
  }));

  // Add new players
  await prisma.player.createMany({
    data: newPlayerInputs,
    skipDuplicates: true
  });

  const newPlayers = await prisma.player.findMany({
    where: { username: { in: newPlayerInputs.map(n => n.username) } }
  });

  // Sort the resulting players list by the order of the input usernames
  const standardizedUsernames = usernames.map(standardize);

  return [...foundPlayers, ...newPlayers].sort(
    (a, b) => standardizedUsernames.indexOf(a.username) - standardizedUsernames.indexOf(b.username)
  );
}

export { findOrCreatePlayers };
