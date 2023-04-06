import prisma, { Player, setHooksEnabled } from '../../../../prisma';
import { ServerError } from '../../../errors';
import * as snapshotServices from '../../snapshots/snapshot.services';
import * as playerUtils from '../player.utils';
import { findPlayer } from './FindPlayerService';

async function archivePlayer(player: Player): Promise<void> {
  const latestSnapshot = await snapshotServices.findPlayerSnapshot({ id: player.id });
  const cutoffDate = latestSnapshot.createdAt;

  // Get all the memberships and participations that should be transfered to the new player
  const splitData = await playerUtils.splitArchivalData(player.id, cutoffDate);

  // Find a free random username for the archived player (archive#####)
  const archiveUsername = await findAvailableArchiveUsername();

  // TODO: set player status to archived

  // Change the archived player's username to the random username
  await prisma.player.update({
    where: { id: player.id },
    data: { username: archiveUsername, displayName: archiveUsername }
  });

  // Create a new player archive
  await prisma.playerArchive.create({
    data: {
      playerId: player.id,
      archiveUsername,
      previousUsername: player.username
    }
  });

  // Now that the disputed username is free, create a new player for it
  const [newPlayer, isNew] = await findPlayer({
    username: player.displayName,
    createIfNotFound: true
  });

  if (!isNew) {
    throw new ServerError("New player's username wasn't available.");
  }

  // Disable prisma hooks to ensure that we don't get any "player joined group/competition" events
  setHooksEnabled(false);

  // Transfer all post-last-snapshot memberships to the new player
  for (const groupId of splitData.newPlayerGroupIds) {
    await prisma.membership.update({
      where: { playerId_groupId: { playerId: player.id, groupId } },
      data: { playerId: newPlayer.id }
    });
  }

  // Transfer all post-last-snapshot participations to the new player
  for (const competitionId of splitData.newPlayerCompetitionIds) {
    await prisma.participation.update({
      where: { playerId_competitionId: { playerId: player.id, competitionId } },
      data: { playerId: newPlayer.id }
    });
  }

  setHooksEnabled(true);

  await playerUtils.setCachedPlayerId(player.username, null);
}

async function findAvailableArchiveUsername() {
  let archiveUsername = undefined;

  while (!archiveUsername) {
    const randomUsername = `archive${Math.floor(Math.random() * 99999)}`;

    const existingPlayer = await prisma.player.findFirst({
      where: { username: randomUsername }
    });

    if (!existingPlayer) {
      archiveUsername = randomUsername;
    }
  }

  return archiveUsername;
}

export { archivePlayer };
