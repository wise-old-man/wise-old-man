import { z } from 'zod';
import prisma from '../../../../prisma';
import { CompetitionType } from '../../../../utils';

const inputSchema = z.object({
  groupId: z.number().int().positive(),
  playerIds: z.number().int().positive().array()
});

type AddToGroupCompetitionsParams = z.infer<typeof inputSchema>;

async function addToGroupCompetitions(payload: AddToGroupCompetitionsParams): Promise<void> {
  const params = inputSchema.parse(payload);

  // Find all upcoming/ongoing competitions for the group
  const groupCompetitions = await prisma.competition.findMany({
    where: {
      groupId: params.groupId,
      endsAt: { gt: new Date() },
      type: CompetitionType.CLASSIC // shouldn't auto-add players to a team competition
    }
  });

  const newParticipations = [];

  groupCompetitions.forEach(gc => {
    params.playerIds.forEach(playerId => {
      newParticipations.push({ playerId, competitionId: gc.id });
    });
  });

  await prisma.participation.createMany({ data: newParticipations, skipDuplicates: true });
}

export { addToGroupCompetitions };
