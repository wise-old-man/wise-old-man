import { z } from 'zod';
import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import logger from '../../../util/logging';

const inputSchema = z.object({
  id: z.number().int().positive()
});

type DenyNameChangeParams = z.infer<typeof inputSchema>;

async function denyNameChange(payload: DenyNameChangeParams): Promise<NameChange> {
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

  const updatedNameChange = await prisma.nameChange.update({
    where: { id: params.id },
    data: {
      status: NameChangeStatus.DENIED,
      resolvedAt: new Date()
    }
  });

  logger.moderation(`[NameChange:${nameChange.id}] Denied`);

  return updatedNameChange;
}

export { denyNameChange };
