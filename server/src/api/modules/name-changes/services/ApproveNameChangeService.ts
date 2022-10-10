import { z } from 'zod';
import prisma, {
  Player,
  Record,
  Snapshot,
  Membership,
  Participation,
  NameChange,
  NameChangeStatus,
  PrismaTypes,
  modifyRecords,
  PrismaPromise,
  modifySnapshots
} from '../../../../prisma';
import logger from '../../../util/logging';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import * as snapshotServices from '../../snapshots/snapshot.services';
import * as playerServices from '../../players/player.services';
import * as playerEvents from '../../players/player.events';
import * as playerUtils from '../../players/player.utils';
import { prepareRecordValue } from '../../records/record.utils';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type ApproveNameChangeService = z.infer<typeof inputSchema>;

async function approveNameChange(payload: ApproveNameChangeService): Promise<NameChange> {
  const params = inputSchema.parse(payload);

  const nameChange = await prisma.nameChange.findFirst({
    where: { id: params.id }
  });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  if (nameChange.status !== NameChangeStatus.PENDING) {
    throw new BadRequestError('Name change status must be PENDING');
  }

  const [oldPlayer] = await playerServices.findPlayer({ username: nameChange.oldName });
  const [newPlayer] = await playerServices.findPlayer({ username: nameChange.newName });

  if (!oldPlayer) {
    throw new ServerError('Old Player cannot be found in the database anymore.');
  }

  // Attempt to transfer data between both accounts
  await transferPlayerData(oldPlayer, newPlayer, nameChange.newName);

  // If successful, resolve the name change
  const updatedNameChange = await prisma.nameChange.update({
    where: { id: params.id },
    data: {
      status: NameChangeStatus.APPROVED,
      resolvedAt: new Date()
    }
  });

  // Update the player ID caches
  await playerUtils.setCachedPlayerId(nameChange.oldName, null);
  await playerUtils.setCachedPlayerId(nameChange.newName, nameChange.playerId);

  logger.moderation(`[NameChange:${nameChange.id}] Approved`);

  return updatedNameChange;
}

async function transferPlayerData(oldPlayer: Player, newPlayer: Player, newName: string): Promise<void> {
  const transitionDate = (await snapshotServices.findPlayerSnapshot({ id: oldPlayer.id })).createdAt;
  const playerUpdateFields: PrismaTypes.PlayerUpdateInput = {};

  const promises: PrismaPromise<any>[] = [];

  if (newPlayer && oldPlayer.id !== newPlayer.id) {
    // Fetch all of older player's records, to compare to the new ones
    const oldRecords = await prisma.record
      .findMany({
        where: { playerId: oldPlayer.id }
      })
      .then(modifyRecords);

    // Find all of new player's records (post transition date)
    const newRecords = await prisma.record
      .findMany({ where: { playerId: newPlayer.id, updatedAt: { gte: transitionDate } } })
      .then(modifyRecords);

    // Fetch all of new player's snapshots (post transition date)
    const newSnapshots = await prisma.snapshot
      .findMany({ where: { playerId: newPlayer.id, createdAt: { gte: transitionDate } } })
      .then(modifySnapshots);

    // Fetch all of new player's memberships (post transition date)
    const newMemberships = await prisma.membership.findMany({
      where: { playerId: newPlayer.id, createdAt: { gte: transitionDate } }
    });

    // Fetch all of new player's participations (post transition date)
    const newParticipations = await prisma.participation.findMany({
      where: { playerId: newPlayer.id, createdAt: { gte: transitionDate } }
    });

    promises.push(
      // Transfer all snapshots from the newPlayer (post transition date) to the old player
      transferSnapshots(oldPlayer.id, newSnapshots),

      // Transfer all memberships from the newPlayer (post transition date) to the old player
      transferMemberships(oldPlayer.id, newMemberships),

      // Transfer all participations from the newPlayer (post transition date) to the old player
      transferParticipations(oldPlayer.id, newParticipations),

      // Transfer all records from the newPlayer (post transition date) to the old player
      // If some records are lower than the oldPlayer already had, they are discarded in favor of existing ones
      ...transferRecords(oldPlayer.id, oldRecords, newRecords),

      // Delete the new player
      prisma.player.delete({ where: { id: newPlayer.id } })
    );

    if (newPlayer.country && !oldPlayer.country) {
      // Set the player's flag to the new one, if one didn't exist before
      playerUpdateFields.country = newPlayer.country;
    }
  }

  // Update the player to the new username & displayName
  playerUpdateFields.username = playerUtils.standardize(newName);
  playerUpdateFields.displayName = playerUtils.sanitize(newName);
  playerUpdateFields.flagged = false;

  const results = await prisma.$transaction([
    ...promises,
    prisma.player.update({ where: { id: oldPlayer.id }, data: playerUpdateFields })
  ]);

  if (!results || results.length === 0) return;

  playerEvents.onPlayerNameChanged(results[results.length - 1], oldPlayer.displayName);
}

function transferRecords(
  oldPlayerId: number,
  oldRecords: Record[],
  newRecords: Record[]
): PrismaPromise<any>[] {
  const recordsToAdd: Record[] = [];
  const recordsToUpdate: { record: Record; newValue: number }[] = [];

  newRecords.map(n => {
    // Find if this same record definition (playerId/metric/period) existed before
    const oldEquivalent = oldRecords.find(r => r.metric === n.metric && r.period === n.period);

    if (!oldEquivalent) {
      // This record didn't exist before, add it
      recordsToAdd.push(n);
    } else if (oldEquivalent.value < n.value) {
      // This record existed but had a lower value than the new one, update it
      recordsToUpdate.push({ record: oldEquivalent, newValue: n.value });
    }
  });

  const promises: PrismaPromise<any>[] = [];

  if (recordsToAdd.length > 0) {
    promises.push(
      prisma.record.createMany({
        data: recordsToAdd.map(record => ({
          ...record,
          id: undefined,
          playerId: oldPlayerId,
          value: prepareRecordValue(record.metric, record.value)
        }))
      })
    );
  }

  if (recordsToUpdate.length > 0) {
    promises.push(
      ...recordsToUpdate.map(({ record, newValue }) =>
        prisma.record.update({
          where: { id: record.id },
          data: { value: prepareRecordValue(record.metric, newValue) }
        })
      )
    );
  }

  return promises;
}

function transferSnapshots(
  oldPlayerId: number,
  newSnapshots: Snapshot[]
): PrismaPromise<PrismaTypes.BatchPayload> {
  // Transfer all snapshots to the old player id
  return prisma.snapshot.createMany({
    data: newSnapshots.map(snapshot => ({ ...snapshot, id: undefined, playerId: oldPlayerId })),
    skipDuplicates: true
  });
}

function transferMemberships(
  oldPlayerId: number,
  newMemberships: Membership[]
): PrismaPromise<PrismaTypes.BatchPayload> {
  // Transfer all memberships to the old player id
  return prisma.membership.createMany({
    data: newMemberships.map(membership => ({ ...membership, playerId: oldPlayerId })),
    skipDuplicates: true
  });
}

function transferParticipations(
  oldPlayerId: number,
  newParticipations: Participation[]
): PrismaPromise<PrismaTypes.BatchPayload> {
  // Transfer all participations to the old player id
  return prisma.participation.createMany({
    data: newParticipations.map(participation => ({
      ...participation,
      playerId: oldPlayerId,
      startSnapshotId: null,
      endSnapshotId: null
    })),
    skipDuplicates: true
  });
}

export { approveNameChange };
