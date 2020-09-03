import { Participation } from '../../../database/models';
import jobs, { Job } from '../index';

class RevalidateParticipations implements Job {
  name: string;

  constructor() {
    this.name = 'RevalidateParticipations';
  }

  async handle(data: any): Promise<void> {
    const { competition } = data;
    console.log('Running competition!!', competition);

    const participations = await Participation.findAll({
      where: { competitionId: competition.id }
    });

    participations.forEach(p => {
      jobs.add('RevalidateParticipation', {
        competitionId: p.competitionId,
        playerId: p.playerId,
        startsAt: competition.startsAt,
        endsAt: competition.endsAt
      });
    });
  }
}

export default new RevalidateParticipations();
