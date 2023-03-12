import { z } from 'zod';
import prisma from '../../../../prisma';
import { ServerError } from '../../../errors';

const inputSchema = z.object({
  playerId: z.number().positive()
});

type DeleteLastSnapshotParams = z.infer<typeof inputSchema>;

async function deleteLastSnapshot(payload: DeleteLastSnapshotParams) {
  const params = inputSchema.parse(payload);

  const result = await prisma.$executeRaw`
    DELETE FROM public.snapshots
    WHERE "id" IN (
        SELECT "id" FROM public.snapshots
        WHERE "playerId" = ${params.playerId}
        ORDER BY "createdAt" DESC
        LIMIT 1
    )`;

  if (result !== 1) {
    throw new ServerError("Failed to delete a player's last snapshots.");
  }
}

export { deleteLastSnapshot };
