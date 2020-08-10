import { onCompetitionEnding } from 'api/events/competition';
import * as competitionService from 'api/services/internal/competitions';
import { Job } from '../index';

class CompetitionEnding implements Job {
  name: string;

  constructor() {
    this.name = 'CompetitionEnding';
  }

  async handle(data: any): Promise<void> {
    const { competitionId, minutes } = data;
    const competition: any = await competitionService.getDetails(competitionId);

    if (!competition) return;

    // Double check the competition is ending, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs((new Date() as any) - (competition.endsAt - minutes * 60 * 1000)) > 10000) {
      return;
    }

    const period = minutes < 60 ? { minutes } : { hours: minutes / 60 };
    onCompetitionEnding(competition, period);
  }
}

export default new CompetitionEnding();
