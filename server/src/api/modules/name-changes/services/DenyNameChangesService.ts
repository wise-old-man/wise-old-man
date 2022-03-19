import { z } from 'zod';
import prisma, { NameChange } from '../../../../prisma';
import { BadRequestError, NotFoundError } from '../../../errors';
import { NameChangeStatus } from '../name-change.types';

const schema = z.object({
  id: z.number().int().positive()
});

type DenyNameChangeParams = z.infer<typeof schema>;

class DenyNameChangeService {
  validate(payload: any): DenyNameChangeParams {
    return schema.parse(payload);
  }

  async execute(params: DenyNameChangeParams): Promise<NameChange> {
    const nameChange = await prisma.nameChange.findUnique({
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

    return updatedNameChange;
  }
}

export default new DenyNameChangeService();
