import prisma, { Player, Record, NameChange, NameChangeStatus, PrismaTypes } from '../../../../prisma';
import { ActivityType, MemberActivity, PlayerStatus } from '../../../../utils';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import { archivePlayer } from '../../players/services/ArchivePlayerService';
import * as playerEvents from '../../players/player.events';
import * as playerUtils from '../../players/player.utils';
import { prepareRecordValue } from '../../records/record.utils';

async function approveNameChange(id: number): Promise<NameChange> {
  const nameChange = await prisma.nameChange.findFirst({
    where: { id }
  });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  if (nameChange.status !== NameChangeStatus.PENDING) {
    throw new BadRequestError('Name change status must be PENDING');
  }

  const oldPlayer = await prisma.player.findFirst({
    where: { username: playerUtils.standardize(nameChange.oldName) }
  });

  const newPlayer = await prisma.player.findFirst({
    where: { username: playerUtils.standardize(nameChange.newName) }
  });

  if (!oldPlayer) {
    throw new ServerError('Old Player cannot be found in the database anymore.');
  }

  if (newPlayer && newPlayer.id !== oldPlayer.id) {
    // Archive the "new" profile, in case we need to restore some of this data later
    await archivePlayer(newPlayer, false);
  }

  // Attempt to transfer data between both accounts
  const updatedPlayer = await transferPlayerData(oldPlayer, newPlayer, nameChange.newName).catch(e => {
    logger.debug('Failed to transfer name change data.', e);
    throw e;
  });

  // If successful, resolve the name change
  const updatedNameChange = await prisma.nameChange.update({
    where: { id },
    data: {
      status: NameChangeStatus.APPROVED,
      resolvedAt: new Date(),
      reviewContext: PrismaTypes.DbNull
    }
  });

  if (oldPlayer.status === PlayerStatus.ARCHIVED) {
    const archive = await prisma.playerArchive.findFirst({
      where: {
        playerId: oldPlayer.id,
        restoredAt: null
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (archive) {
      await prisma.playerArchive.update({
        data: {
          restoredAt: new Date(),
          restoredUsername: updatedPlayer.username
        },
        where: {
          playerId_createdAt: {
            playerId: archive.playerId,
            createdAt: archive.createdAt
          }
        }
      });
    }
  }

  playerEvents.onPlayerNameChanged(updatedPlayer, oldPlayer.displayName);

  logger.moderation(`[NameChange:${nameChange.id}] Approved`);

  if (newPlayer && newPlayer.id !== oldPlayer.id) {
    const archivedNewPlayer = await prisma.player.findFirst({
      where: {
        id: newPlayer.id
      }
    });

    if (archivedNewPlayer && archivedNewPlayer.status === PlayerStatus.ARCHIVED) {
      const snapshots = await prisma.snapshot.findMany({
        where: {
          playerId: archivedNewPlayer.id
        }
      });

      if (snapshots.length < 2) {
        await prisma.player.delete({
          where: { id: archivedNewPlayer.id }
        });
      }
    }
  }

  return updatedNameChange as NameChange;
}

async function transferPlayerData(
  oldPlayer: Player,
  newPlayer: Player | null,
  newName: string
): Promise<Player> {
  const transitionDate = await prisma.snapshot
    .findFirst({
      where: { playerId: oldPlayer.id },
      select: { createdAt: true },
      orderBy: { createdAt: 'desc' }
    })
    .then(s => s!.createdAt);

  const playerUpdateFields: PrismaTypes.PlayerUpdateInput = {};

  const newPlayerExists = newPlayer && oldPlayer.id !== newPlayer.id;

  let oldRecords: Record[] = [];
  let newRecords: Record[] = [];
  let memberActivity: MemberActivity[] = [];

  if (newPlayerExists) {
    // Fetch all of older player's records, to compare to the new ones
    oldRecords = await prisma.record.findMany({
      where: { playerId: oldPlayer.id }
    });

    // Find all of new player's records (post transition date)
    newRecords = await prisma.record.findMany({
      where: { playerId: newPlayer.id, updatedAt: { gte: transitionDate } }
    });

    memberActivity = await prisma.memberActivity.findMany({
      where: {
        OR: [
          { playerId: oldPlayer.id, type: ActivityType.LEFT },
          { playerId: newPlayer.id, type: ActivityType.JOINED }
        ]
      }
    });
  }

  const result = await prisma
    .$transaction(async transaction => {
      // had to, ffs
      const tx = transaction as unknown as PrismaTypes.TransactionClient;

      if (newPlayerExists) {
        // Transfer all snapshots from the newPlayer (post transition date) to the old player
        await transferSnapshots(tx, oldPlayer.id, newPlayer.id, transitionDate);

        // Deduplicate joined/left member activity created before the name change
        await deduplicateGroupActivity(tx, memberActivity);

        // Transfer all memberships from the newPlayer (post transition date) to the old player
        await transferMemberships(tx, oldPlayer.id, newPlayer.id, transitionDate);

        // Transfer all participations from the newPlayer (post transition date) to the old player
        await transferParticipations(tx, oldPlayer.id, newPlayer.id, transitionDate);

        // Transfer all approved name changes from the newPlayer (post transition date) to the old player
        await transferNameChanges(tx, oldPlayer.id, newPlayer.id, transitionDate);

        // Transfer all records from the newPlayer (post transition date) to the old player
        await transferRecords(tx, oldPlayer.id, oldRecords, newRecords);

        if (newPlayer.country && !oldPlayer.country) {
          // Set the player's flag to the new one, if one didn't exist before
          playerUpdateFields.country = newPlayer.country;
        }
      }

      // Update the player to the new username & displayName
      playerUpdateFields.username = playerUtils.standardize(newName);
      playerUpdateFields.displayName = playerUtils.sanitize(newName);
      playerUpdateFields.status = PlayerStatus.ACTIVE;

      const updatedPlayer = await tx.player.update({
        where: { id: oldPlayer.id },
        data: playerUpdateFields
      });

      return updatedPlayer as unknown as Player;
    })
    .catch(e => {
      logger.error('Failed to transfer name change data', e);
      throw new ServerError('Failed to transfer name change data');
    });

  return result;
}

/**
 * If a player changes their name in-game without submitting on WOM and their group gets synced,
 * WOM will register oldName has having left, and newName has having joined.
 * Eventually, when this name change is submitted and approve, we should find these matching
 * left/join events and delete them from the database.
 */
async function deduplicateGroupActivity(
  transaction: PrismaTypes.TransactionClient,
  memberActivity: MemberActivity[]
) {
  if (memberActivity.length === 0) return;

  const leftActivity = memberActivity.filter(activity => {
    return activity.type === ActivityType.LEFT;
  });

  const joinedActivity = memberActivity.filter(activity => {
    return activity.type === ActivityType.JOINED;
  });

  const activityToDelete: MemberActivity[] = [];

  for (const left of leftActivity) {
    for (const joined of joinedActivity) {
      if (left.groupId === joined.groupId && left.createdAt.getTime() === joined.createdAt.getTime()) {
        activityToDelete.push(left, joined);
      }
    }
  }

  if (activityToDelete.length > 0) {
    await transaction.memberActivity.deleteMany({
      where: {
        OR: activityToDelete.map(activity => ({
          groupId: activity.groupId,
          playerId: activity.playerId,
          createdAt: activity.createdAt,
          type: activity.type
        }))
      }
    });
  }
}

async function transferRecords(
  transaction: PrismaTypes.TransactionClient,
  oldPlayerId: number,
  oldRecords: Record[],
  newRecords: Record[]
) {
  const recordsToAdd: Record[] = [];
  const recordsToUpdate: { oldRecord: Record; newRecord: Record }[] = [];

  newRecords.map(n => {
    // Find if this same record definition (playerId/metric/period) existed before
    const oldEquivalent = oldRecords.find(r => r.metric === n.metric && r.period === n.period);

    if (!oldEquivalent) {
      // This record didn't exist before, add it
      recordsToAdd.push(n);
    } else if (oldEquivalent.value < n.value) {
      // This record existed but had a lower value than the new one, update it
      recordsToUpdate.push({ oldRecord: oldEquivalent, newRecord: n });
    }
  });

  for (const record of recordsToAdd) {
    await transaction.record.update({
      where: { id: record.id },
      data: {
        playerId: oldPlayerId,
        value: prepareRecordValue(record.metric, record.value)
      }
    });
  }

  for (const { oldRecord, newRecord } of recordsToUpdate) {
    await transaction.record.update({
      where: { id: oldRecord.id },
      data: {
        value: prepareRecordValue(oldRecord.metric, newRecord.value)
      }
    });

    await transaction.record.delete({
      where: { id: newRecord.id }
    });
  }
}

function transferSnapshots(
  transaction: PrismaTypes.TransactionClient,
  oldPlayerId: number,
  newPlayerId: number,
  transitionDate: Date
) {
  // Transfer all snapshots (post transition) to the old player id
  return transaction.snapshot.updateMany({
    where: {
      playerId: newPlayerId,
      createdAt: { gte: transitionDate }
    },
    data: {
      playerId: oldPlayerId
    }
  });
}

function transferNameChanges(
  transaction: PrismaTypes.TransactionClient,
  oldPlayerId: number,
  newPlayerId: number,
  transitionDate: Date
) {
  // Transfer all approved name changes (post transition) to the old player id
  return transaction.nameChange.updateMany({
    where: {
      playerId: newPlayerId,
      status: NameChangeStatus.APPROVED,
      resolvedAt: { gte: transitionDate }
    },
    data: {
      playerId: oldPlayerId
    }
  });
}

function transferMemberships(
  transaction: PrismaTypes.TransactionClient,
  oldPlayerId: number,
  newPlayerId: number,
  transitionDate: Date
) {
  // Transfer all memberships (post transition) to the old player id
  return transaction.membership.updateMany({
    where: {
      playerId: newPlayerId,
      createdAt: { gte: transitionDate }
    },
    data: {
      playerId: oldPlayerId
    }
  });
}

function transferParticipations(
  transaction: PrismaTypes.TransactionClient,
  oldPlayerId: number,
  newPlayerId: number,
  transitionDate: Date
) {
  // Transfer all participations (post transition) to the old player id
  return transaction.participation.updateMany({
    where: {
      playerId: newPlayerId,
      createdAt: { gte: transitionDate }
    },
    data: {
      playerId: oldPlayerId,
      startSnapshotId: null,
      endSnapshotId: null
    }
  });
}

export { approveNameChange };
