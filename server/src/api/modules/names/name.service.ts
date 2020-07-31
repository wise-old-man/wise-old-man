import { NameChange } from '../../../database';
import { NameChangeStatus } from '../../../database/models/NameChange';
import { BadRequestError, NotFoundError, ServerError } from '../../errors';
import * as playerService from '../players/player.service';
import * as snapshotService from '../snapshots/snapshot.service';

/**
 * Submit a new name change request, from oldName to newName.
 */
async function submit(oldName: string, newName: string) {
  // Check if a player with the "oldName" username is registered
  const oldPlayer = await playerService.find(oldName);

  if (!oldPlayer) {
    throw new BadRequestError(`Error: Player "${oldName}" is not tracked yet."`);
  }

  // Check if there's any pending name changes for these names
  const pendingRequest = await NameChange.findOne({
    where: { oldName, newName, status: NameChangeStatus.PENDING }
  });

  if (pendingRequest) {
    throw new BadRequestError("Error: There's already a similar pending name change request.");
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
async function refresh(nameChangeId: number) {
  const nameChange = await NameChange.findOne({ where: { id: nameChangeId } });

  if (!nameChange) {
    throw new NotFoundError('Id not found.');
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
 * Calculate the "likelihood" rating of a particular
 * name change between oldName and newName.
 */
async function calculateRating(oldName: string, newName: string): Promise<number> {
  let rating = 0;

  try {
    // Attempt to fetch hiscores data for the new name
    const newHiscoresData = await playerService.getHiscoresData(newName);

    const oldPlayer = await playerService.find(oldName);
    const newPlayer = await playerService.find(newName);

    // Fetch the last snapshot from the old name
    const oldStats = await snapshotService.findLatest(oldPlayer.id);

    // Fetch either the first snapshot of the new name, or the current hiscores stats
    const newStats = newPlayer
      ? await snapshotService.findFirstSince(newPlayer.id, oldStats.createdAt)
      : await snapshotService.fromRS(-1, newHiscoresData);

    // If the old username is not found in the hiscores
    playerService.getHiscoresData(oldName).catch(e => {
      if (e instanceof BadRequestError) rating += 1;
    });

    // If has no negative gains between the old and new stats
    if (!snapshotService.hasNegativeGains(oldStats, newStats)) {
      rating += 2;
    }

    // If has no excessive gains (over ehp and ehb) between the old and new stats
    if (!snapshotService.hasExcessiveGains(oldStats, newStats)) {
      rating += 2;
    }
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
    // If the player could not be found on the hiscores, 0 rating
    if (e instanceof BadRequestError) return 0;
  }

  return rating;
}

export { submit, refresh };
