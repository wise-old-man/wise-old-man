import prisma, { PrismaTypes } from '../../../../prisma';
import logger from '../../../../services/logging.service';
import {
  MemberActivity,
  MemberActivityType,
  Membership,
  NameChange,
  NameChangeStatus,
  Participation,
  Period,
  Player,
  PlayerAnnotation,
  PlayerStatus,
  Record
} from '../../../../types';
import { prepareDecimalValue } from '../../../../utils/prepare-decimal-value.util';
import { PeriodProps } from '../../../../utils/shared';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import { eventEmitter, EventType } from '../../../events';
import * as playerUtils from '../../players/player.utils';
import { archivePlayer } from '../../players/services/ArchivePlayerService';

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
    logger.error('Failed to transfer name change data.', e);
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

  eventEmitter.emit(EventType.PLAYER_NAME_CHANGED, {
    username: updatedPlayer.username,
    previousDisplayName: oldPlayer.displayName
  });

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
        },
        select: {
          playerId: true
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
  let oldAnnotations: PlayerAnnotation[] = [];
  let memberActivity: MemberActivity[] = [];
  let oldMemberships: Membership[] = [];
  let oldParticipations: Participation[] = [];

  if (newPlayerExists) {
    // Fetch all of older player's records, to compare to the new ones
    oldRecords = await prisma.record.findMany({
      where: { playerId: oldPlayer.id }
    });

    // Find all of new player's records (post transition date)
    newRecords = await prisma.record.findMany({
      where: { playerId: newPlayer.id, updatedAt: { gte: transitionDate } }
    });

    oldAnnotations = await prisma.playerAnnotation.findMany({
      where: { playerId: oldPlayer.id }
    });

    memberActivity = await prisma.memberActivity.findMany({
      where: {
        OR: [
          { playerId: oldPlayer.id, type: MemberActivityType.LEFT },
          { playerId: newPlayer.id, type: MemberActivityType.JOINED }
        ]
      }
    });

    oldMemberships = await prisma.membership.findMany({
      where: {
        playerId: oldPlayer.id
      }
    });

    oldParticipations = await prisma.participation.findMany({
      where: {
        playerId: oldPlayer.id
      }
    });
  }

  if (newPlayerExists) {
    const snapshotsToTransfer = await prisma.snapshot.findMany({
      where: {
        playerId: newPlayer.id,
        createdAt: { gte: transitionDate }
      }
    });

    if (snapshotsToTransfer.length > 0) {
      logger.info(`snapshotsToTransfer | count:${snapshotsToTransfer.length}`);

      const normalizeDate = (date: Date) => {
        const copy = new Date(date.getTime());
        copy.setHours(0, 0, 0, 0);
        return copy;
      };

      const distinctDays = new Set(snapshotsToTransfer.map(s => normalizeDate(s.createdAt).getTime()));
      logger.info(`snapshotsToTransfer | distinctDays:${distinctDays.size}`);

      const oldestSnapshotDate = snapshotsToTransfer.sort(
        (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
      )[0].createdAt;

      const overYearOld =
        oldestSnapshotDate.getTime() < new Date().getTime() - PeriodProps[Period.YEAR].milliseconds;

      logger.info(`snapshotsToTransfer | oldest:${oldestSnapshotDate.toISOString()} | year:${overYearOld}`);
    }
  }

  const result = await prisma
    .$transaction(async transaction => {
      // had to, ffs
      const tx = transaction as unknown as PrismaTypes.TransactionClient;

      if (newPlayerExists) {
        await transaction.player.update({
          where: {
            id: newPlayer.id
          },
          data: {
            latestSnapshotDate: null
          }
        });

        // Deduplicate joined/left member activity created before the name change
        await deduplicateGroupActivity(tx, memberActivity);

        // Transfer all participations from the newPlayer (post transition date) to the old player
        await transferParticipations(tx, oldPlayer.id, newPlayer.id, transitionDate, oldParticipations);

        // Transfer all memberships from the newPlayer (post transition date) to the old player
        await transferMemberships(tx, oldPlayer.id, newPlayer.id, transitionDate, oldMemberships);

        // Transfer all snapshots from the newPlayer (post transition date) to the old player
        await transferSnapshots(tx, oldPlayer.id, newPlayer.id, transitionDate);

        // Transfer all approved name changes from the newPlayer (post transition date) to the old player
        await transferNameChanges(tx, oldPlayer.id, newPlayer.id, transitionDate);

        // Transfer all player annotations
        await transferAnnotations(tx, oldPlayer.id, newPlayer.id, transitionDate, oldAnnotations);

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
    return activity.type === MemberActivityType.LEFT;
  });

  const joinedActivity = memberActivity.filter(activity => {
    return activity.type === MemberActivityType.JOINED;
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
      where: {
        playerId_period_metric: {
          playerId: record.playerId,
          period: record.period,
          metric: record.metric
        }
      },
      data: {
        playerId: oldPlayerId,
        value: prepareDecimalValue(record.metric, record.value)
      }
    });
  }

  for (const { oldRecord, newRecord } of recordsToUpdate) {
    await transaction.record.update({
      where: {
        playerId_period_metric: {
          playerId: oldRecord.playerId,
          period: oldRecord.period,
          metric: oldRecord.metric
        }
      },
      data: {
        value: prepareDecimalValue(oldRecord.metric, newRecord.value)
      }
    });

    await transaction.record.delete({
      where: {
        playerId_period_metric: {
          playerId: newRecord.playerId,
          period: newRecord.period,
          metric: newRecord.metric
        }
      }
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

function transferAnnotations(
  transaction: PrismaTypes.TransactionClient,
  oldPlayerId: number,
  newPlayerId: number,
  transitionDate: Date,
  oldAnnotations: PlayerAnnotation[]
) {
  return transaction.playerAnnotation.updateMany({
    where: {
      playerId: newPlayerId,
      type: { notIn: oldAnnotations.map(a => a.type) },
      createdAt: { gte: transitionDate }
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
  transitionDate: Date,
  oldMemberships: Membership[]
) {
  // Transfer all memberships (post transition) to the old player id
  return transaction.membership.updateMany({
    where: {
      playerId: newPlayerId,
      groupId: { notIn: oldMemberships.map(m => m.groupId) }, // Only if old player isn't already on the group
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
  transitionDate: Date,
  oldParticipations: Participation[]
) {
  // Transfer all participations (post transition) to the old player id
  return transaction.participation.updateMany({
    where: {
      playerId: newPlayerId,
      competitionId: { notIn: oldParticipations.map(m => m.competitionId) }, // Only if old player isn't already on the comp
      createdAt: { gte: transitionDate }
    },
    data: {
      playerId: oldPlayerId,
      startSnapshotId: null,
      endSnapshotId: null,
      startSnapshotDate: null,
      endSnapshotDate: null
    }
  });
}

export { approveNameChange };
