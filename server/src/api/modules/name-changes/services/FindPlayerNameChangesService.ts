import { z } from 'zod';
import prisma, { NameChange } from '../../../../prisma';
import { NameChangeStatus } from '../name-change.types';

const schema = z.object({
  playerId: z.number().int().positive()
});

type FindPlayerNameChangesParams = z.infer<typeof schema>;

class FindPlayerNameChangesService {
  validate(payload: any): FindPlayerNameChangesParams {
    return schema.parse(payload);
  }

  async execute(params: FindPlayerNameChangesParams): Promise<NameChange[]> {
    // Query the database for all name changes of "playerId"
    const nameChanges = await prisma.nameChange.findMany({
      where: { playerId: params.playerId, status: NameChangeStatus.APPROVED },
      orderBy: { resolvedAt: 'desc' }
    });

    return nameChanges;
  }
}

export default new FindPlayerNameChangesService();
