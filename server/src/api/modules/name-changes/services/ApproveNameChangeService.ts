import { z } from 'zod';
import { omit } from 'lodash';
import { sequelize } from '../../../../database';
import { Membership, Participation, Player, Record, Snapshot } from '../../../../database/models';
import { Op, Transaction, WhereOptions } from 'sequelize';
import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';
import { BadRequestError, NotFoundError, ServerError } from '../../../errors';
import * as playerService from '../../../services/internal/player.service';
import * as snapshotServices from '../../snapshots/snapshot.services';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type ApproveNameChangeService = z.infer<typeof inputSchema>;

async function approveNameChange(payload: ApproveNameChangeService): Promise<NameChange> {
  const params = inputSchema.parse(payload);

  const nameChange = await prisma.nameChange.findUnique({
    where: { id: params.id }
  });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  if (nameChange.status !== NameChangeStatus.PENDING) {
    throw new BadRequestError('Name change status must be PENDING');
  }

  const oldPlayer = await playerService.find(nameChange.oldName);
  const newPlayer = await playerService.find(nameChange.newName);

  if (!oldPlayer) {
    throw new ServerError('Old Player cannot be found in the database anymore.');
  }

  // Attempt to transfer data between both accounts
  await transferData(oldPlayer, newPlayer, nameChange.newName);

  // If successful, resolve the name change
  const updatedNameChange = await prisma.nameChange.update({
    where: { id: params.id },
    data: {
      status: NameChangeStatus.APPROVED,
      resolvedAt: new Date()
    }
  });

  return updatedNameChange;
}

async function transferData(oldPlayer: Player, newPlayer: Player, newName: string): Promise<void> {
  const transitionDate = (await snapshotServices.findPlayerSnapshot({ id: oldPlayer.id })).createdAt;

  await sequelize.transaction(async transaction => {
    if (newPlayer && oldPlayer.id !== newPlayer.id) {
      // Include only the data gathered after the name change transition started
      const createdFilter = {
        playerId: newPlayer.id,
        createdAt: { [Op.gte]: transitionDate }
      };

      const updatedFilter = {
        playerId: newPlayer.id,
        updatedAt: { [Op.gte]: transitionDate }
      };

      await transferRecords(updatedFilter, oldPlayer.id, transaction);
      await transferSnapshots(createdFilter, oldPlayer.id, transaction);
      await transferMemberships(createdFilter, oldPlayer.id, transaction);
      await transferParticipations(createdFilter, oldPlayer.id, transaction);

      // Transfer the player's country, if needed/possible
      if (newPlayer.country && !oldPlayer.country) {
        oldPlayer.country = newPlayer.country;
      }

      // Delete the new player account
      await newPlayer.destroy({ transaction });
    }

    // Update the player to the new username & displayName
    oldPlayer.username = playerService.standardize(newName);
    oldPlayer.displayName = playerService.sanitize(newName);
    oldPlayer.flagged = false;

    await oldPlayer.save({ transaction });
  });
}

async function transferSnapshots(filter: WhereOptions, targetId: number, transaction: Transaction) {
  // Fetch all of new player's snapshots (post transition date)
  const newSnapshots = await Snapshot.findAll({ where: filter });

  // Transfer all snapshots to the old player id
  const movedSnapshots = newSnapshots.map(s => {
    return omit({ ...s.toJSON(), playerId: targetId }, 'id');
  });

  // Add all these snapshots, ignoring duplicates
  await Snapshot.bulkCreate(movedSnapshots, { ignoreDuplicates: true, transaction });
}

async function transferParticipations(filter: WhereOptions, targetId: number, transaction: Transaction) {
  // Fetch all of new player's participations (post transition date)
  const newParticipations = await Participation.findAll({ where: filter });

  // Transfer all participations to the old player id
  const movedParticipations = newParticipations.map(ns => ({
    ...ns.toJSON(),
    playerId: targetId,
    startSnapshotId: null,
    endSnapshotId: null
  }));

  // Add all these participations, ignoring duplicates
  await Participation.bulkCreate(movedParticipations, { ignoreDuplicates: true, transaction });
}

async function transferMemberships(filter: WhereOptions, targetId: number, transaction: Transaction) {
  // Fetch all of new player's memberships (post transition date)
  const newMemberships = await Membership.findAll({ where: filter });

  // Transfer all memberships to the old player id
  const movedMemberships = newMemberships.map(ns => ({ ...ns.toJSON(), playerId: targetId }));

  // Add all these memberships, ignoring duplicates
  await Membership.bulkCreate(movedMemberships, { ignoreDuplicates: true, hooks: false, transaction });
}

async function transferRecords(filter: WhereOptions, targetId: number, transaction: Transaction) {
  // Fetch all of the old records, and the recent new records
  const oldRecords = await Record.findAll({ where: { playerId: targetId } });
  const newRecords = await Record.findAll({ where: filter });

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

  if (recordsToAdd.length > 0) {
    await Record.bulkCreate(
      recordsToAdd.map(({ period, metric, value }) => ({ playerId: targetId, period, metric, value })),
      { transaction }
    );
  }

  if (recordsToUpdate.length > 0) {
    await Promise.all(
      recordsToUpdate.map(async ({ record, newValue }) => {
        await record.update({ value: newValue }, { transaction });
      })
    );
  }
}

export { approveNameChange };
