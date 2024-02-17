import prisma from '../../../../prisma';
import { BadRequestError } from '../../../errors';

async function clearNameChangeHistory(playerId: number): Promise<{ count: number }> {
  const { count } = await prisma.nameChange.deleteMany({
    where: { playerId }
  });

  if (count === 0) {
    throw new BadRequestError('No name changes were found for this player.');
  }

  return { count };
}

export { clearNameChangeHistory };
