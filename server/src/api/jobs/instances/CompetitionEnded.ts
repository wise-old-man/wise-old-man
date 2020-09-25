import { onCompetitionEnded } from '../../events/competition.events';
import * as competitionService from '../../services/internal/competition.service';
import { Job } from '../index';

class CompetitionEnded implements Job {
  name: string;

  constructor() {
    this.name = 'CompetitionEnded';
  }

  async handle(data: any): Promise<void> {
    const { competitionId } = data;

    const competition = await competitionService.resolve(competitionId, true);

    if (!competition) return;

    // Double check the competition just ended, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs(Date.now() - competition.endsAt.getTime()) > 10000) {
      return;
    }

    const competitionDetails = await competitionService.getDetails(competition);
    onCompetitionEnded(competitionDetails);
  }
}

export default new CompetitionEnded();
