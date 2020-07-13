import { onCompetitionEnding } from '../../events';
import * as competitionService from '../../modules/competitions/competition.service';

export default {
  name: 'CompetitionEnding',
  async handle({ data }) {
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
};
