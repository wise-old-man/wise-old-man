import { fetchCompetitionDetails } from '../../api/modules/competitions/services/FetchCompetitionDetailsService';
import prisma, { PrismaTypes } from '../../prisma';
import { Job } from '../job.class';
import { JobPriority } from '../types/job-priority.enum';
import { JobType } from '../types/job-type.enum';

interface Payload {
  competitionId: number;
  trigger: 'competition-started' | 'competition-ending-2h' | 'competition-ending-12h';
}

export class UpdateCompetitionParticipantsJob extends Job<Payload> {
  static getUniqueJobId(payload: Payload) {
    return [payload.competitionId, payload.trigger].join('_');
  }

  async execute(payload: Payload) {
    if (process.env.NODE_ENV === 'test') {
      return;
    }

    if (payload.trigger === 'competition-ending-2h') {
      const competitionDetails = await fetchCompetitionDetails(payload.competitionId);

      competitionDetails.participations
        .filter(p => p.progress.gained > 0) // Only update players that have gained xp
        .forEach(p => {
          this.jobManager.add(JobType.UPDATE_PLAYER, {
            username: p.player.username
          });
        });

      return;
    }

    const participantsQuery: PrismaTypes.ParticipationWhereInput = {
      competitionId: payload.competitionId
    };

    if (payload.trigger === 'competition-ending-12h') {
      participantsQuery.player = {
        OR: [
          {
            updatedAt: {
              lt: new Date(Date.now() - 1000 * 60 * 60 * 24)
            }
          },
          { updatedAt: null }
        ]
      };
    }

    const participants = await prisma.participation.findMany({
      where: participantsQuery,
      include: {
        player: { select: { username: true } }
      }
    });

    participants.forEach(({ player }) => {
      this.jobManager.add(
        JobType.UPDATE_PLAYER,
        { username: player.username },
        { priority: payload.trigger === 'competition-started' ? JobPriority.HIGH : JobPriority.LOW }
      );
    });
  }
}
