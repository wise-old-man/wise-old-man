import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';
import { BadRequestError } from '../../../errors';
import * as nameChangeEvents from '../name-change.events';
import { isValidUsername, sanitize, standardize } from '../../../modules/players/player.utils';

async function submitNameChange(oldName: string, newName: string): Promise<NameChange> {
  if (!isValidUsername(oldName)) {
    throw new BadRequestError(`Invalid old name.`);
  }

  if (!isValidUsername(newName)) {
    throw new BadRequestError(`Invalid new name.`);
  }

  if (sanitize(oldName) === sanitize(newName)) {
    throw new BadRequestError('Old name and new name cannot be the same.');
  }

  // Standardize both input usernames (convert to lower case, remove symbols)
  const stOldName = standardize(oldName);
  const stNewName = standardize(newName);

  // Check if a player with the "oldName" username is registered
  const oldPlayer = await prisma.player.findFirst({
    where: { username: stOldName }
  });

  if (!oldPlayer) {
    throw new BadRequestError(`Player '${oldName}' is not tracked yet.`);
  }

  // Check if there's any pending name changes for these names
  const pending = await prisma.nameChange.findFirst({
    where: {
      oldName: { equals: stOldName, mode: 'insensitive' },
      newName: { equals: stNewName, mode: 'insensitive' },
      status: NameChangeStatus.PENDING
    }
  });

  if (pending) {
    throw new BadRequestError(`There's already a similar pending name change. (Id: ${pending.id})`);
  }

  // To prevent people from submitting duplicate name change requests, which then
  // will waste time and resources to process and deny, it's best to check if this
  // exact same name change has been approved.
  if (stOldName !== stNewName) {
    const newPlayer = await prisma.player.findFirst({
      where: { username: stNewName }
    });

    if (newPlayer) {
      const lastChange = await prisma.nameChange.findFirst({
        where: { playerId: newPlayer.id, status: NameChangeStatus.APPROVED },
        orderBy: { createdAt: 'desc' }
      });

      if (lastChange && standardize(lastChange.oldName) === stOldName) {
        throw new BadRequestError(`Cannot submit a duplicate (approved) name change. (Id: ${lastChange.id})`);
      }
    }
  } else {
    const lastChange = await prisma.nameChange.findFirst({
      where: { playerId: oldPlayer.id, status: NameChangeStatus.APPROVED },
      orderBy: { createdAt: 'desc' }
    });

    if (lastChange && standardize(lastChange.oldName) === stOldName) {
      throw new BadRequestError(`Cannot submit a duplicate (approved) name change. (Id: ${lastChange.id})`);
    }
  }

  // Create a new instance (a new name change request)
  const newNameChange = (await prisma.nameChange.create({
    data: {
      playerId: oldPlayer.id,
      oldName: oldPlayer.displayName,
      newName: sanitize(newName)
    }
  })) as NameChange;

  nameChangeEvents.onNameChangeSubmitted(newNameChange);

  return newNameChange;
}

export { submitNameChange };
