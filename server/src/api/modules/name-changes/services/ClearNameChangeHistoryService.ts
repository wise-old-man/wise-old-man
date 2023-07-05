import { z } from 'zod';
import prisma from '../../../../prisma';
import { BadRequestError } from '../../../errors';

const inputSchema = z.object({
  playerId: z.number().int().positive()
});

type ClearNameChangeHistoryParams = z.infer<typeof inputSchema>;

async function clearNameChangeHistory(payload: ClearNameChangeHistoryParams): Promise<{ count: number }> {
  const { playerId } = inputSchema.parse(payload);

  const { count } = await prisma.nameChange.deleteMany({
    where: { playerId }
  });

  if (count === 0) {
    throw new BadRequestError('No name changes were found for this player.');
  }

  return { count };
}

export { clearNameChangeHistory };
