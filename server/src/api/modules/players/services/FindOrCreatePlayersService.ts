import prisma from '../../../../prisma';
import { Player, PlayerAnnotationType } from '../../../../types';
import { optOutFilter } from '../../../../utils/shared/player-annotation.utils';
import { sanitizeDisplayName, standardizeUsername } from '../player.utils';

async function findOrCreatePlayers(usernames: string[]): Promise<Player[]> {
  const foundPlayers = await prisma.player.findMany({
    where: {
      username: { in: usernames.map(standardizeUsername) },
      ...optOutFilter(PlayerAnnotationType.OPT_OUT)
    }
  });

  // If all players exist on the database already, great, just return them.
  if (foundPlayers.length === usernames.length) return foundPlayers;

  // Find the already registered usernames
  const foundUsernames = foundPlayers.map(f => f.username);

  // Find the unregistered usernames
  const missingUsernames = usernames.filter(u => !foundUsernames.includes(standardizeUsername(u)));

  const newPlayerInputs = missingUsernames.map(m => ({
    username: standardizeUsername(m),
    displayName: sanitizeDisplayName(m)
  }));

  // Add new players
  await prisma.player.createMany({
    data: newPlayerInputs,
    skipDuplicates: true
  });

  const newPlayers = await prisma.player.findMany({
    where: {
      username: { in: newPlayerInputs.map(n => n.username) },
      ...optOutFilter(PlayerAnnotationType.OPT_OUT)
    }
  });

  // Sort the resulting players list by the order of the input usernames
  const standardizedUsernames = usernames.map(standardizeUsername);

  return [...foundPlayers, ...newPlayers].sort(
    (a, b) => standardizedUsernames.indexOf(a.username) - standardizedUsernames.indexOf(b.username)
  );
}

export { findOrCreatePlayers };
