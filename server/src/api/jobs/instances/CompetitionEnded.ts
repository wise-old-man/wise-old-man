import * as competitionService from '@services/internal/competitions';
import { onCompetitionEnded } from '../../events';
import { Job } from '../index';

class CompetitionEnded implements Job {
  name: string;

  constructor() {
    this.name = 'CompetitionEnded';
  }

  async handle(data: any): Promise<void> {
    const { competitionId } = data;
    const competition: any = await competitionService.getDetails(competitionId);

    if (!competition) return;

    // Double check the competition just ended, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs((new Date() as any) - competition.endsAt) > 10000) {
      return;
    }

    onCompetitionEnded(competition);
  }
}

export default new CompetitionEnded();
