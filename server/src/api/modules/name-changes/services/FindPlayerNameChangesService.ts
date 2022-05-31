import { z } from 'zod';
import prisma, { NameChange, NameChangeStatus } from '../../../../prisma';

const inputSchema = z.object({
  playerId: z.number().int().positive()
});

type FindPlayerNameChangesParams = z.infer<typeof inputSchema>;

async function findPlayerNameChanges(payload: FindPlayerNameChangesParams): Promise<NameChange[]> {
  const params = inputSchema.parse(payload);

  // Query the database for all (approved) name changes of "playerId"
  const nameChanges = await prisma.nameChange.findMany({
    where: { playerId: params.playerId, status: NameChangeStatus.APPROVED },
    orderBy: { resolvedAt: 'desc' }
  });

  return nameChanges;
}

export { findPlayerNameChanges };
