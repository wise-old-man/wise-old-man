import { PlayerStatus } from '../../../../utils';
import { ServerError } from '../../../../api/errors';
import logger from '../../../util/logging';
import prisma, { NameChangeStatus, Player, setHooksEnabled } from '../../../../prisma';
import * as discordService from '../../../services/external/discord.service';
import * as playerUtils from '../player.utils';
import * as playerEvents from '../player.events';
import { findPlayerSnapshot } from '../../snapshots/services/FindPlayerSnapshotService';

interface ArchivePlayerResult {
  newPlayer: Player | null;
  archivedPlayer: Player;
}

async function archivePlayer(player: Player, createNewPlayer = true): Promise<ArchivePlayerResult> {
  let splitData: Awaited<ReturnType<typeof playerUtils.splitArchivalData>> | null = null;

  if (createNewPlayer) {
    const latestSnapshot = await findPlayerSnapshot({ id: player.id });

    // Get all the memberships and participations that should be transfered to the new player
    splitData = await playerUtils.splitArchivalData(player.id, latestSnapshot.createdAt);
  }

  // Find a free random username for the archived player (archive#####)
  const archiveUsername = await findAvailableArchiveUsername();

  // Run all these changes in a database transaction, so that it rolls back in case of error
  const result = await prisma
    .$transaction(async transaction => {
      // Change the archived player's username to the random username
      const archivedPlayer = await transaction.player.update({
        where: { id: player.id },
        data: {
          username: archiveUsername,
          displayName: archiveUsername,
          status: PlayerStatus.ARCHIVED,
          exp: 0,
          ehp: 0,
          ehb: 0,
          ttm: 0,
          tt200m: 0
        }
      });

      // Create a new player archive
      await transaction.playerArchive.create({
        data: {
          playerId: player.id,
          archiveUsername,
          previousUsername: player.username
        }
      });

      if (!createNewPlayer) {
        return { archivedPlayer, newPlayer: null };
      }

      // Now that the disputed username is free, create a new player for it
      const newPlayer = await transaction.player.create({
        data: {
          username: player.username,
          displayName: player.displayName
        }
      });

      // Disable prisma hooks to ensure that we don't get any "player joined group/competition" events
      setHooksEnabled(false);

      // Deny every pending name change for the archived player
      await transaction.nameChange.updateMany({
        where: { playerId: player.id, status: NameChangeStatus.PENDING },
        data: { status: NameChangeStatus.DENIED }
      });

      // Transfer all post-last-snapshot memberships to the new player
      for (const groupId of splitData.newPlayerGroupIds) {
        await transaction.membership.update({
          where: { playerId_groupId: { playerId: player.id, groupId } },
          data: { playerId: newPlayer.id }
        });
      }

      // Transfer all post-last-snapshot participations to the new player
      for (const competitionId of splitData.newPlayerCompetitionIds) {
        await transaction.participation.update({
          where: { playerId_competitionId: { playerId: player.id, competitionId } },
          data: { playerId: newPlayer.id }
        });
      }

      setHooksEnabled(true);

      return { archivedPlayer, newPlayer };
    })
    .catch(e => {
      logger.error('Failed to archive player', e);
      discordService.sendMonitoringMessage(`🔴 Failed to archive \`${player.username}\``, true);

      throw new ServerError('Failed to archive player');
    });

  await playerUtils.setCachedPlayerId(player.username, null);

  playerEvents.onPlayerArchived(result.archivedPlayer, player.displayName);

  return result;
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
