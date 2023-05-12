import { z } from 'zod';
import { PlayerStatus } from '../../../../utils';
import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';
import { BadRequestError } from '../../../errors';
import * as playerUtils from '../../../modules/players/player.utils';
import * as playerServices from '../../../modules/players/player.services';
import * as nameChangeEvents from '../name-change.events';

const inputSchema = z
  .object({
    oldName: z.string(),
    newName: z.string()
  })
  .refine(s => playerUtils.isValidUsername(s.oldName), { message: 'Invalid old name.' })
  .refine(s => playerUtils.isValidUsername(s.newName), { message: 'Invalid new name.' })
  .refine(s => playerUtils.sanitize(s.oldName) !== playerUtils.sanitize(s.newName), {
    message: 'Old name and new name cannot be the same.'
  });

type SubmitNameChangeParams = z.infer<typeof inputSchema>;

async function submitNameChange(payload: SubmitNameChangeParams): Promise<NameChange> {
  const params = inputSchema.parse(payload);

  // Standardize both input usernames (convert to lower case, remove symbols)
  const stOldName = playerUtils.standardize(params.oldName);
  const stNewName = playerUtils.standardize(params.newName);

  // Check if a player with the "oldName" username is registered
  const [oldPlayer] = await playerServices.findPlayer({ username: stOldName });

  if (!oldPlayer) {
    throw new BadRequestError(`Player '${params.oldName}' is not tracked yet.`);
  }

  if (oldPlayer.status === PlayerStatus.ARCHIVED) {
    throw new BadRequestError('Failed to submit name change: Player is archived.');
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
    const [newPlayer] = await playerServices.findPlayer({ username: stNewName });

    if (newPlayer) {
      const lastChange = await prisma.nameChange.findFirst({
        where: { playerId: newPlayer.id, status: NameChangeStatus.APPROVED },
        orderBy: { createdAt: 'desc' }
      });

      if (lastChange && playerUtils.standardize(lastChange.oldName) === stOldName) {
        throw new BadRequestError(`Cannot submit a duplicate (approved) name change. (Id: ${lastChange.id})`);
      }
    }
  } else {
    const lastChange = await prisma.nameChange.findFirst({
      where: { playerId: oldPlayer.id, status: NameChangeStatus.APPROVED },
      orderBy: { createdAt: 'desc' }
    });

    if (lastChange && playerUtils.standardize(lastChange.oldName) === stOldName) {
      throw new BadRequestError(`Cannot submit a duplicate (approved) name change. (Id: ${lastChange.id})`);
    }
  }

  // Create a new instance (a new name change request)
  const newNameChange = (await prisma.nameChange.create({
    data: {
      playerId: oldPlayer.id,
      oldName: oldPlayer.displayName,
      newName: playerUtils.sanitize(params.newName)
    }
  })) as NameChange;

  nameChangeEvents.onNameChangeSubmitted(newNameChange);

  return newNameChange;
}

export { submitNameChange };
