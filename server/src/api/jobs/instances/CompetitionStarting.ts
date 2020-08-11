import { onCompetitionStarting } from 'api/events/competitions';
import * as competitionService from 'api/services/internal/competition.service';
import { Job } from '../index';

class CompetitionStarting implements Job {
  name: string;

  constructor() {
    this.name = 'CompetitionStarting';
  }

  async handle(data: any): Promise<void> {
    const { competitionId, minutes } = data;
    const competition: any = await competitionService.getDetails(competitionId);

    if (!competition) return;

    // Double check the competition is starting, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs((new Date() as any) - (competition.startsAt - minutes * 60 * 1000)) > 10000) {
      return;
    }

    const period = minutes < 60 ? { minutes } : { hours: minutes / 60 };
    onCompetitionStarting(competition, period);
  }
}

export default new CompetitionStarting();
