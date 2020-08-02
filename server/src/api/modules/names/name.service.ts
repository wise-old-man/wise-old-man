import { NameChange } from '../../../database';
import { NameChangeStatus } from '../../../database/models/NameChange';
import env from '../../../env';
import { BadRequestError, NotFoundError, ServerError } from '../../errors';
import * as efficiencyService from '../efficiency/efficiency.service';
import * as playerService from '../players/player.service';
import * as snapshotService from '../snapshots/snapshot.service';

/**
 * Submit a new name change request, from oldName to newName.
 */
async function submit(oldName: string, newName: string): Promise<NameChange> {
  // Check if a player with the "oldName" username is registered
  const oldPlayer = await playerService.find(oldName);

  if (!oldPlayer) {
    throw new BadRequestError(`Player "${oldName}" is not tracked yet."`);
  }

  // Check if there's any pending name changes for these names
  const pendingRequest = await NameChange.findOne({
    where: { oldName, newName, status: NameChangeStatus.PENDING }
  });

  if (pendingRequest) {
    throw new BadRequestError("There's already a similar pending name change request.");
  }

  // Calculate the name change likelihood rating
  const rating = await calculateRating(oldName, newName);

  // Create a new instance (a new name change request)
  const nameChange = NameChange.create({
    playerId: oldPlayer.id,
    oldName,
    newName,
    rating
  });

  return nameChange;
}

/**
 * Refresh the rating of a given name change instance.
 */
async function refresh(id: number): Promise<NameChange> {
  const nameChange = await NameChange.findOne({ where: { id } });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  const newRating = await calculateRating(nameChange.oldName, nameChange.newName);

  // The rating has changed since the last refresh
  if (newRating !== nameChange.rating) {
    nameChange.rating = newRating;
    await nameChange.save();
  }

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

async function getDetails(id: number) {
  const nameChange = await NameChange.findOne({ where: { id } });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  let newHiscores;
  let oldHiscores;

  try {
    // Attempt to fetch hiscores data for the new name
    newHiscores = await playerService.getHiscoresData(nameChange.newName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
    // If the new username could not be found on the hiscores
    // TODO:
    if (e instanceof BadRequestError) return 0;
  }

  try {
    oldHiscores = await playerService.getHiscoresData(nameChange.oldName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
  }

  const oldPlayer = await playerService.find(nameChange.oldName);
  const newPlayer = await playerService.find(nameChange.newName);

  // Fetch the last snapshot from the old name
  const oldStats = await snapshotService.findLatest(oldPlayer.id);

  // Fetch either the first snapshot of the new name, or the current hiscores stats
  let newStats = await snapshotService.fromRS(-1, newHiscores);

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

  const ehpDiff = efficiencyService.calculateEHPDiff(oldStats, newStats);
  const ehbDiff = efficiencyService.calculateEHBDiff(oldStats, newStats);

  return {
    nameChange,
    data: {
      isNewOnHiscores: !!newHiscores,
      isOldOnHiscores: !!oldHiscores,
      isNewTracked: !!newPlayer,
      timeDiff,
      hoursDiff,
      ehpDiff,
      ehbDiff,
      oldStats: snapshotService.format(oldStats),
      newStats: snapshotService.format(newStats)
    }
  };
}

/**
 * Calculate the "likelihood" rating of a particular
 * name change between oldName and newName.
 */
async function calculateRating(oldName: string, newName: string): Promise<number> {
  let rating = 0;
  let newHiscores;
  let oldHiscores;

  try {
    // Attempt to fetch hiscores data for the new name
    newHiscores = await playerService.getHiscoresData(newName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
    // If the new username could not be found on the hiscores
    if (e instanceof BadRequestError) return 0;
  }

  try {
    oldHiscores = await playerService.getHiscoresData(oldName);
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
    // If the old username is no longer on the hiscores
    if (e instanceof BadRequestError) rating += 1;
  }

  const oldPlayer = await playerService.find(oldName);
  const newPlayer = await playerService.find(newName);

  // Fetch the last snapshot from the old name
  const oldStats = await snapshotService.findLatest(oldPlayer.id);

  // Fetch either the first snapshot of the new name, or the current hiscores stats
  let newStats = await snapshotService.fromRS(-1, newHiscores);

  if (newPlayer) {
    // If the new name is already a tracked player and was tracked
    // since the old name's last snapshot, use this first "post change"
    // snapshot as a starting point
    const postChangeSnapshot = await snapshotService.findFirstSince(newPlayer.id, oldStats.createdAt);

    if (postChangeSnapshot) {
      newStats = postChangeSnapshot;
    }
  }

  // If the old name's current hiscores data exists, convert to snapshot
  const curOldStats = oldHiscores ? await snapshotService.fromRS(-1, oldHiscores) : null;

  // If the old name's current hiscores data matches their lastest stats,
  // Then that account has not changed its name. Abort mission
  if (snapshotService.withinRange(oldStats, curOldStats)) {
    return 0;
  }

  // If has no negative gains between the old and new stats
  if (!snapshotService.hasNegativeGains(oldStats, newStats)) {
    rating += 2;
  }

  // If has no excessive gains (over ehp and ehb) between the old and new stats
  if (!snapshotService.hasExcessiveGains(oldStats, newStats)) {
    rating += 4;
  }

  return rating;
}

export { submit, refresh, deny, getDetails };
