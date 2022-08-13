import { z } from 'zod';
import prisma from '../../../../prisma';

const inputSchema = z.object({
  groupId: z.number().positive(),
  playerIds: z.number().positive().array()
});

type RemoveFromGroupCompetitionsParams = z.infer<typeof inputSchema>;

async function removeFromGroupCompetitions(payload: RemoveFromGroupCompetitionsParams): Promise<void> {
  const params = inputSchema.parse(payload);

  // Find all upcoming/ongoing competitions for the group
  const groupCompetitions = await prisma.competition.findMany({
    where: {
      groupId: params.groupId,
      endsAt: { gt: new Date() }
    }
  });

  await prisma.participation.deleteMany({
    where: {
      competitionId: { in: groupCompetitions.map(gc => gc.id) },
      playerId: { in: params.playerIds }
    }
  });
}

export { removeFromGroupCompetitions };
