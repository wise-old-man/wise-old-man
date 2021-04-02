import { onCompetitionEnded } from '../../events/competition.events';
import metricsService from '../../services/external/metrics.service';
import * as competitionService from '../../services/internal/competition.service';
import { Job } from '../index';

class CompetitionEnded implements Job {
  name: string;

  constructor() {
    this.name = 'CompetitionEnded';
  }

  async handle(data: any): Promise<void> {
    const { competitionId } = data;
    const endTimer = metricsService.trackJobStarted();

    try {
      const competition = await competitionService.resolve(competitionId, { includeGroup: true });

      if (!competition) return;

      // Double check the competition just ended, since the
      // competition start date can be changed between the
      // scheduling and execution of this job
      if (Math.abs(Date.now() - competition.endsAt.getTime()) > 10000) {
        return;
      }

      const competitionDetails = await competitionService.getDetails(competition);
      onCompetitionEnded(competitionDetails);

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new CompetitionEnded();
