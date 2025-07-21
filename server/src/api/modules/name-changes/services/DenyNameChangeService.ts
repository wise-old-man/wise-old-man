import prisma from '../../../../prisma';
import { NameChange, NameChangeDenyContext, NameChangeStatus } from '../../../../types';
import { BadRequestError, NotFoundError } from '../../../errors';

async function denyNameChange(id: number, reviewContext: NameChangeDenyContext): Promise<NameChange> {
  const nameChange = await prisma.nameChange.findFirst({
    where: { id }
  });

  if (!nameChange) {
    throw new NotFoundError('Name change id was not found.');
  }

  if (nameChange.status !== NameChangeStatus.PENDING) {
    throw new BadRequestError('Name change status must be PENDING');
  }

  const updatedNameChange = await prisma.nameChange.update({
    where: { id },
    data: {
      resolvedAt: new Date(),
      status: NameChangeStatus.DENIED,
      reviewContext
    }
  });

  return updatedNameChange as NameChange;
}

export { denyNameChange };
