import { omit } from 'lodash';
import { Op, Transaction, WhereOptions } from 'sequelize';
import { sequelize } from '../../../database';
import {
  Membership,
  NameChange,
  Participation,
  Player,
  Record,
  Snapshot
} from '../../../database/models';
import env from '../../../env';
import { NameChangeStatus, Pagination } from '../../../types';
import { SKILLS } from '../../constants';
import { BadRequestError, NotFoundError, ServerError } from '../../errors';
import { getLevel } from '../../util/experience';
import { buildQuery } from '../../util/query';
import * as jagexService from '../external/jagex.service';
import * as efficiencyService from './efficiency.service';
import * as playerService from './player.service';
import * as snapshotService from './snapshot.service';

/**
 * List all name changes, filtered by a specific status
 */
async function getList(username: string, status: number, pagination: Pagination): Promise<NameChange[]> {
  // Isn't a valid NameChangeStatus
  if (status && !NameChangeStatus[status]) {
    throw new BadRequestError('Invalid status.');
  }

  const query = buildQuery({ status });

  if (username && username.length > 0) {
    query[Op.or] = [
      { oldName: { [Op.like]: `${username}%` } },
      { newName: { [Op.like]: `${username}%` } }
    ];
  }

  const nameChanges = await NameChange.findAll({
    where: query,
    order: [['createdAt', 'DESC']],
    limit: pagination.limit,
    offset: pagination.offset
  });

  return nameChanges;
}

async function getPlayerNames(playerId: number): Promise<NameChange[]> {
  const nameChanges = await NameChange.findAll({
    where: { playerId, status: NameChangeStatus.APPROVED },
    order: [['resolvedAt', 'DESC']]
  });

  return nameChanges;
}

async function bulkSubmit(nameChanges: { oldName: string; newName: string }[]) {
  if (!nameChanges || !Array.isArray(nameChanges)) {
    throw new BadRequestError('Invalid name change list format.');
  }

  if (nameChanges.length === 0) {
    throw new BadRequestError('Empty name change list.');
  }

  if (nameChanges.some(n => !n.oldName || !n.newName)) {
    throw new BadRequestError('All name change objects must have "oldName" and "newName" properties.');
  }

  const submitted = await Promise.all(
    nameChanges.map(async ({ oldName, newName }) => {
      try {
        return await submit(oldName, newName);
      } catch (error) {
        return null;
      }
    })
  );

  const submittedCount = submitted.filter(s => !!s).length;

  if (submittedCount === 0) {
    throw new BadRequestError(`Could not find any valid name changes to submit.`);
  }

  return `Successfully submitted ${submittedCount}/${nameChanges.length} name changes.`;
}

/**
 * Submit a new name change request, from oldName to newName.
 */
async function submit(oldName: string, newName: string): Promise<NameChange> {
  if (!playerService.isValidUsername(oldName)) {
    throw new BadRequestError('Invalid old name.');
  }

  if (!playerService.isValidUsername(newName)) {
    throw new BadRequestError('Invalid new name.');
  }

  const stOldName = playerService.standardize(oldName);
  const stNewName = playerService.standardize(newName);

  if (stOldName === stNewName) {
    throw new BadRequestError('Old and new names must be different.');
  }

  // Check if a player with the "oldName" username is registered
  const oldPlayer = await playerService.find(stOldName);

  if (!oldPlayer) {
    throw new BadRequestError(`Player '${oldName}' is not tracked yet.`);
  }

  // Check if there's any pending name changes for these names
  const pending = await NameChange.findOne({
    where: {
      oldName: stOldName,
      newName: stNewName,
      status: NameChangeStatus.PENDING
    }
  });

  if (pending) {
    throw new BadRequestError(`There's already a similar pending name change. (Id: ${pending.id})`);
  }

  const newPlayer = await playerService.find(stNewName);

  // To prevent people from submitting duplicate name change requests, which then
  // will waste time and resources to process and deny, it's best to check if this
  // exact same name change has been approved.
  if (newPlayer) {
    const lastChange = await NameChange.findOne({
      where: { playerId: newPlayer.id, status: NameChangeStatus.APPROVED },
      order: [['createdAt', 'DESC']]
    });

    if (lastChange && playerService.standardize(lastChange.oldName) === stOldName) {
      throw new BadRequestError(
        `Cannot submit a duplicate (approved) name change. (Id: ${lastChange.id})`
      );
    }
  }

  // Create a new instance (a new name change request)
  const nameChange = await NameChange.create({
    playerId: oldPlayer.id,
    oldName: stOldName,
    newName: stNewName
  });

  return nameChange;
}

/**
 * Denies a pending name change request.
 */
async function deny(id: number, adminPassword: string): Promise<NameChange> {
  const nameChange = await NameChange.findOne({ where: { id } });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  if (nameChange.status !== NameChangeStatus.PENDING) {
    throw new BadRequestError('Name change status must be PENDING');
  }

  if (adminPassword !== env.ADMIN_PASSWORD) {
    throw new BadRequestError('Incorrect password.');
  }

  nameChange.status = NameChangeStatus.DENIED;
  await nameChange.save();

  return nameChange;
}

/**
 * Approves a pending name change request,
 * and transfer all the oldName's data to the newName.
 */
async function approve(id: number, adminPassword: string): Promise<NameChange> {
  const nameChange = await NameChange.findOne({ where: { id } });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  if (nameChange.status !== NameChangeStatus.PENDING) {
    throw new BadRequestError('Name change status must be PENDING');
  }

  if (adminPassword !== env.ADMIN_PASSWORD) {
    throw new BadRequestError('Incorrect password.');
  }

  const oldPlayer = await playerService.find(nameChange.oldName);
  const newPlayer = await playerService.find(nameChange.newName);

  if (!oldPlayer) {
    throw new ServerError('Old Player cannot be found in the database anymore.');
  }

  // Attempt to transfer data between both accounts
  await transferData(oldPlayer, newPlayer, nameChange.newName);

  // If successful, resolve the name change
  nameChange.status = NameChangeStatus.APPROVED;
  nameChange.resolvedAt = new Date();
  await nameChange.save();

  return nameChange;
}

async function getDetails(id: number) {
  const nameChange = await NameChange.findOne({ where: { id } });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  const oldPlayer = await playerService.find(nameChange.oldName);
  const newPlayer = await playerService.find(nameChange.newName);

  if (!oldPlayer || nameChange.status !== NameChangeStatus.PENDING) {
    return { nameChange, data: {} };
  }

  let newHiscores;
  let oldHiscores;

  try {
    // Attempt to fetch hiscores data for the new name
    newHiscores = await jagexService.getHiscoresData(nameChange.newName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
  }

  try {
    oldHiscores = await jagexService.getHiscoresData(nameChange.oldName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
  }

  // Fetch the last snapshot from the old name
  const oldStats = await snapshotService.findLatest(oldPlayer.id);

  if (!oldStats) {
    throw new ServerError('Old stats could not be found.');
  }

  // Fetch either the first snapshot of the new name, or the current hiscores stats
  let newStats = newHiscores ? await snapshotService.fromRS(-1, newHiscores) : null;

  if (newPlayer) {
    // If the new name is already a tracked player and was tracked
    // since the old name's last snapshot, use this first "post change"
    // snapshot as a starting point
    const postChangeSnapshot = await snapshotService.findFirstSince(newPlayer.id, oldStats.createdAt);

    if (postChangeSnapshot) {
      newStats = postChangeSnapshot;
    }
  }

  const afterDate = newStats && newStats.createdAt ? newStats.createdAt : new Date();
  const timeDiff = afterDate.getTime() - oldStats.createdAt.getTime();
  const hoursDiff = timeDiff / 1000 / 60 / 60;

  const ehpDiff = newStats ? efficiencyService.calculateEHPDiff(oldStats, newStats) : 0;
  const ehbDiff = newStats ? efficiencyService.calculateEHBDiff(oldStats, newStats) : 0;

  const hasNegativeGains = newStats ? snapshotService.hasNegativeGains(oldStats, newStats) : false;

  return {
    nameChange,
    data: {
      isNewOnHiscores: !!newHiscores,
      isOldOnHiscores: !!oldHiscores,
      isNewTracked: !!newPlayer,
      hasNegativeGains,
      timeDiff,
      hoursDiff,
      ehpDiff,
      ehbDiff,
      oldStats: snapshotService.format(oldStats),
      newStats: snapshotService.format(newStats)
    }
  };
}

async function autoReview(id: number): Promise<void> {
  let details;

  try {
    details = await getDetails(id);
  } catch (error) {
    if (error.message === 'Old stats could not be found.') {
      await deny(id, env.ADMIN_PASSWORD);
      return;
    }
  }

  if (!details || details.nameChange.status !== NameChangeStatus.PENDING) return;

  const { isNewOnHiscores, hasNegativeGains, hoursDiff, ehpDiff, ehbDiff, oldStats } = details.data;

  // If new name is not on the hiscores
  if (!isNewOnHiscores) {
    await deny(id, env.ADMIN_PASSWORD);
    return;
  }

  // If has lost exp/kills/scores, deny request
  if (hasNegativeGains) {
    await deny(id, env.ADMIN_PASSWORD);
    return;
  }

  const baseMaxHours = 504;
  const extraHours = (oldStats['overall'].experience / 2_000_000) * 168;

  // If the transition period is over (3 weeks + 1 week per each 2m exp)
  if (hoursDiff > baseMaxHours + extraHours) {
    return;
  }

  // If has gained too much exp/kills
  if (ehpDiff + ehbDiff > hoursDiff) {
    return;
  }

  const totalLevel = SKILLS.filter(s => s !== 'overall')
    .map(s => getLevel(oldStats[s].experience))
    .reduce((acc, cur) => acc + cur);

  // If is high level enough (high level swaps are harder to fake)
  if (totalLevel < 700) {
    return;
  }

  // All seems to be fine, auto approve
  await approve(id, env.ADMIN_PASSWORD);
}

async function transferData(oldPlayer: Player, newPlayer: Player, newName: string): Promise<void> {
  const transitionDate = (await snapshotService.findLatest(oldPlayer.id))?.createdAt;
  const standardizedName = playerService.standardize(newName);

  await sequelize.transaction(async transaction => {
    if (newPlayer) {
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

      // Delete the new player account
      await newPlayer.destroy({ transaction });
    }

    // Update the player to the new username & displayName
    oldPlayer.username = standardizedName;
    oldPlayer.displayName = standardizedName;
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

  const outdated: { record: Record; newValue: number }[] = [];

  newRecords.forEach(n => {
    const oldEquivalent = oldRecords.find(r => r.metric === n.metric && r.period === n.period);

    // If the new player's record is higher than the old player's,
    // add the old one  to the outdated list
    if (oldEquivalent && oldEquivalent.value < n.value) {
      outdated.push({ record: oldEquivalent, newValue: n.value });
    }
  });

  // Update all "outdated records"
  await Promise.all(
    outdated.map(async ({ record, newValue }) => {
      await record.update({ value: newValue }, { transaction });
    })
  );
}

export { getList, getDetails, getPlayerNames, submit, bulkSubmit, deny, approve, autoReview };
