import prisma from '../../prisma';
import { JobHandler } from '../types/job-handler.type';
import { JobType } from '../types/job-type.enum';

interface Payload {
  competitionId: number;
  playerIds: number[];
}

export const UpdateNewCompetitionParticipantsJobHandler: JobHandler<Payload> = {
  async execute(payload, context) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (payload.playerIds.length === 0) {
      return;
    }

    const competition = await prisma.competition.findFirst({
      where: { id: payload.competitionId }
    });

    if (
      competition === null ||
      competition.startsAt.getTime() > Date.now() ||
      competition.endsAt.getTime() < Date.now()
    ) {
      // If the competition has not started yet or has already ended, we don't need to update anyone.
      return;
    }

    const players = await prisma.player.findMany({
      where: {
        id: {
          in: payload.playerIds
        }
      },
      select: {
        username: true
      }
    });

    players.forEach(({ username }) => {
      context.jobManager.add(JobType.UPDATE_PLAYER, { username });
    });
  }
};
