import { z } from 'zod';
import prisma, { NameChange } from '../../../../prisma';
import { NameChangeStatus } from '../name-change.types';

const inputSchema = z.object({
  playerId: z.number().int().positive()
});

type FindPlayerNameChangesParams = z.infer<typeof inputSchema>;

async function findPlayerNameChanges(payload: FindPlayerNameChangesParams): Promise<NameChange[]> {
  const params = inputSchema.parse(payload);

  // Query the database for all (approveD) name changes of "playerId"
  const nameChanges = await prisma.nameChange.findMany({
    where: { playerId: params.playerId, status: NameChangeStatus.APPROVED },
    orderBy: { resolvedAt: 'desc' }
  });

  return nameChanges;
}

export { findPlayerNameChanges };
