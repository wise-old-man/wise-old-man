import { eventDispatch } from '../../events';
import * as competitionService from '../../modules/competitions/competition.service';

export default {
  name: 'CompetitionStarting',
  async handle({ data }) {
    const { competitionId, minutes } = data;
    const competition: any = await competitionService.getDetails(competitionId);

    if (!competition) return;

    // Double check the competition is starting, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs((new Date() as any) - (competition.startsAt - minutes * 60 * 1000)) > 10000) {
      return;
    }

    // Add all onCompetitionStarting actions below

    if (competition.groupId) {
      const period = minutes <= 60 ? { minutes } : { hours: minutes / 60 };
      eventDispatch('GroupCompetitionStarting', { competition, period });
    }
  }
};
