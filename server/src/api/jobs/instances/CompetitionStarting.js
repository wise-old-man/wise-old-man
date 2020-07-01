const events = require('../../events');
const competitionService = require('../../modules/competitions/competition.service');

module.exports = {
  name: 'CompetitionStarting',
  async handle({ data }) {
    const { competitionId, minutes } = data;
    const competition = await competitionService.getDetails(competitionId);

    if (!competition) return;

    // Double check the competition is starting, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs(new Date() - (competition.startsAt - minutes * 60 * 1000)) > 10000) {
      return;
    }

    // Add all onCompetitionStarting actions below

    if (competition.groupId) {
      const period = minutes <= 60 ? { minutes } : { hours: minutes / 60 };
      events.dispatch('GroupCompetitionStarting', { competition, period });
    }
  }
};
