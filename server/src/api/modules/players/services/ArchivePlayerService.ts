import { ServerError } from '../../../../api/errors';
import prisma from '../../../../prisma';
import logger from '../../../../services/logging.service';
import { NameChangeStatus, Player, PlayerStatus } from '../../../../types';
import { eventEmitter, EventType } from '../../../events';
import { splitArchivalData } from '../player.utils';

interface ArchivePlayerResult {
  newPlayer: Player | null;
  archivedPlayer: Player;
}

async function archivePlayer(player: Player, createNewPlayer = true): Promise<ArchivePlayerResult> {
  let splitData: Awaited<ReturnType<typeof splitArchivalData>> | null = null;

  if (createNewPlayer) {
    const latestSnapshot = await prisma.snapshot.findFirst({
      where: { playerId: player.id },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    });

    if (!latestSnapshot) {
      throw new ServerError('Failed to archive player (latest snapshot not found).');
    }

    // Get all the memberships and participations that should be transfered to the new player
    splitData = await splitArchivalData(player.id, latestSnapshot.createdAt);
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
          tt200m: 0,
          latestSnapshotDate: null
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

      // Deny every pending name change for the archived player
      await transaction.nameChange.updateMany({
        where: { playerId: player.id, status: NameChangeStatus.PENDING },
        data: { status: NameChangeStatus.DENIED }
      });

      if (splitData) {
        // Transfer all post-last-snapshot memberships to the new player
        for (const groupId of splitData.newPlayerGroupIds) {
          await transaction.membership.update({
            where: {
              playerId_groupId: {
                playerId: player.id,
                groupId
              }
            },
            data: {
              playerId: newPlayer.id
            }
          });
        }

        // Transfer all post-last-snapshot participations to the new player
        for (const competitionId of splitData.newPlayerCompetitionIds) {
          await transaction.participation.update({
            where: {
              playerId_competitionId: {
                playerId: player.id,
                competitionId
              }
            },
            data: {
              playerId: newPlayer.id,
              startSnapshotDate: null,
              endSnapshotDate: null
            }
          });
        }
      }

      return { archivedPlayer, newPlayer };
    })
    .catch(e => {
      logger.error('Failed to archive player', e);

      throw new ServerError('Failed to archive player');
    });

  eventEmitter.emit(EventType.PLAYER_ARCHIVED, {
    username: result.archivedPlayer.username,
    previousUsername: player.username
  });

  return result;
}

async function findAvailableArchiveUsername() {
  let archiveUsername: string | undefined = undefined;

  do {
    const randomUsername = `archive${Math.floor(Math.random() * 99999)}`;

    const existingPlayer = await prisma.player.findFirst({
      where: { username: randomUsername }
    });

    if (!existingPlayer) {
      archiveUsername = randomUsername;
    }
  } while (!archiveUsername);

  return archiveUsername;
}

export { archivePlayer };
