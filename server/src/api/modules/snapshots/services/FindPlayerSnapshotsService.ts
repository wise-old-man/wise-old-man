import { z } from 'zod';
import prisma, { Snapshot, modifySnapshots } from '../../../../prisma';

const inputSchema = z.object({
  id: z.number().int().positive(),
  limit: z.number().int().positive().optional().default(100_000)
});

type FindPlayerSnapshotsParams = z.infer<typeof inputSchema>;

async function findPlayerSnapshots(payload: FindPlayerSnapshotsParams): Promise<Snapshot[]> {
  const params = inputSchema.parse(payload);

  const snapshots = await prisma.snapshot
    .findMany({
      where: { playerId: params.id },
      orderBy: { createdAt: 'desc' },
      take: params.limit
    })
    .then(modifySnapshots);

  return snapshots;
}

export { findPlayerSnapshots };
