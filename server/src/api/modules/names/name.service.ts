import { NameChange } from '../../../database';
import { BadRequestError, ServerError } from '../../errors';
import * as playerService from '../players/player.service';
import * as snapshotService from '../snapshots/snapshot.service';
import { NameChangeStatus } from './nameChange.model';

/**
 * Submit a new name change request, from oldName to newName.
 */
async function submit(oldName: string, newName: string) {
  if (!oldName) {
    throw new BadRequestError('Error: Empty "old" name.');
  }

  if (!newName) {
    throw new BadRequestError('Error: Empty "new" name.');
  }

  if (!playerService.isValidUsername(oldName)) {
    throw new BadRequestError('Error: Invalid "old" name.');
  }

  if (!playerService.isValidUsername(newName)) {
    throw new BadRequestError('Error: Invalid "new" name.');
  }

  // Standardize names to "username" sanitized format.
  const oldUsername = playerService.standardize(oldName);
  const newUsername = playerService.standardize(newName);

  if (oldUsername === newUsername) {
    throw new BadRequestError('Error: Old and New names must be different.');
  }

  const oldPlayer = await playerService.find(oldUsername);

  if (!oldPlayer) {
    throw new BadRequestError(`Error: Player "${oldName}" is not tracked yet."`);
  }

  // Check if there's any pending name changes for these names
  const matches = await NameChange.findOne({
    where: {
      oldName: oldUsername,
      newName: newUsername,
      status: NameChangeStatus.PENDING
    }
  });

  if (matches) {
    throw new BadRequestError("Error: There's already a similar pending name change request.");
  }

  const rating = await calculateRating(oldUsername, newUsername);

  const nameChange = NameChange.build({
    playerId: oldPlayer.id,
    oldName: oldUsername,
    newName: newUsername,
    rating
  });

  await nameChange.save();

  return nameChange;
}

/**
 * Calculate the "likelihood" rating of a particular
 * name change between oldName and newName.
 */
async function calculateRating(oldName: string, newName: string) {
  try {
    let rating = 0;

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

    return rating;
  } catch (e) {
    // If te hiscores failed to load, abort mission
    if (e instanceof ServerError) throw e;
    // If the player could not be found on the hiscores, 0 rating
    if (e instanceof BadRequestError) return 0;
  }
}

export { submit };
