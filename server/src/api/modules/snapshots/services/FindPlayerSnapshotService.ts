import { z } from 'zod';
import prisma, { Snapshot, modifySnapshots } from '../../../../prisma';

const inputSchema = z.object({
  id: z.number().int().positive(),
  minDate: z.date().optional(),
  maxDate: z.date().optional()
});

type FindPlayerSnapshotParams = z.infer<typeof inputSchema>;

async function findPlayerSnapshot(payload: FindPlayerSnapshotParams): Promise<Snapshot | null> {
  const params = inputSchema.parse(payload);

  const snapshot = await prisma.snapshot.findFirst({
    where: {
      playerId: params.id,
      createdAt: params.minDate ? { gte: params.minDate } : { lte: params.maxDate || new Date() }
    },
    orderBy: {
      createdAt: params.minDate ? 'asc' : 'desc'
    }
  });

  return snapshot ? modifySnapshots([snapshot])[0] : null;
}

export { findPlayerSnapshot };
