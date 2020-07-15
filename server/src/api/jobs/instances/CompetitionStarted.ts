import { onCompetitionStarted } from '../../events';
import * as competitionService from '../../modules/competitions/competition.service';
import { Job } from '../index';

class CompetitionStarted implements Job {
  name: string;

  constructor() {
    this.name = 'CompetitionStarted';
  }

  async handle(data: any): Promise<void> {
    const { competitionId } = data;
    const competition: any = await competitionService.getDetails(competitionId);

    if (!competition) return;

    // Double check the competition just started, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs((new Date() as any) - competition.startsAt) > 10000) {
      return;
    }

    onCompetitionStarted(competition);
  }
}

export default new CompetitionStarted();
