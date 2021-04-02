import { onCompetitionStarted } from '../../events/competition.events';
import metricsService from '../../services/external/metrics.service';
import * as competitionService from '../../services/internal/competition.service';
import { Job } from '../index';

class CompetitionStarted implements Job {
  name: string;

  constructor() {
    this.name = 'CompetitionStarted';
  }

  async handle(data: any): Promise<void> {
    const { competitionId } = data;
    const endTimer = metricsService.trackJobStarted();

    try {
      const competition = await competitionService.resolve(competitionId, { includeGroup: true });

      if (!competition) return;

      // Double check the competition just started, since the
      // competition start date can be changed between the
      // scheduling and execution of this job
      if (Math.abs(Date.now() - competition.startsAt.getTime()) > 10000) {
        return;
      }

      const competitionDetails = await competitionService.getDetails(competition);
      onCompetitionStarted(competitionDetails);

      metricsService.trackJobEnded(endTimer, this.name, 1);
    } catch (error) {
      metricsService.trackJobEnded(endTimer, this.name, 0);
      throw error;
    }
  }
}

export default new CompetitionStarted();
