import { z } from 'zod';
import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';
import { BadRequestError } from '../../../errors';
import * as playerService from '../../../services/internal/player.service';

const inputSchema = z
  .object({
    oldName: z.string(),
    newName: z.string()
  })
  .refine(s => playerService.isValidUsername(s.oldName), { message: 'Invalid old name.' })
  .refine(s => playerService.isValidUsername(s.newName), { message: 'Invalid new name.' })
  .refine(s => playerService.sanitize(s.oldName) !== playerService.sanitize(s.newName), {
    message: 'Old name and new name cannot be the same.'
  });

type SubmitNameChangeParams = z.infer<typeof inputSchema>;

async function submitNameChange(payload: SubmitNameChangeParams): Promise<NameChange> {
  const params = inputSchema.parse(payload);

  // Standardize both input usernames (convert to lower case, remove symbols)
  const stOldName = playerService.standardize(params.oldName);
  const stNewName = playerService.standardize(params.newName);

  // Check if a player with the "oldName" username is registered
  const oldPlayer = await playerService.find(stOldName);

  if (!oldPlayer) {
    throw new BadRequestError(`Player '${params.oldName}' is not tracked yet.`);
  }

  // If these are the same name, just different capitalizations, skip these checks
  if (stOldName !== stNewName) {
    // Check if there's any pending name changes for these names
    const pending = await prisma.nameChange.findFirst({
      where: {
        oldName: { contains: stOldName, mode: 'insensitive' },
        newName: { contains: stNewName, mode: 'insensitive' },
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
      const lastChange = await prisma.nameChange.findFirst({
        where: { playerId: newPlayer.id, status: NameChangeStatus.APPROVED },
        orderBy: { createdAt: 'desc' }
      });

      if (lastChange && playerService.standardize(lastChange.oldName) === stOldName) {
        throw new BadRequestError(`Cannot submit a duplicate (approved) name change. (Id: ${lastChange.id})`);
      }
    }
  }

  // Create a new instance (a new name change request)
  const newNameChange = await prisma.nameChange.create({
    data: {
      playerId: oldPlayer.id,
      oldName: oldPlayer.displayName,
      newName: playerService.sanitize(params.newName)
    }
  });

  return newNameChange;
}

export { submitNameChange };
