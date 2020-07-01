const events = require('../../events');
const competitionService = require('../../modules/competitions/competition.service');

module.exports = {
  name: 'CompetitionEnding',
  async handle({ data }) {
    const { competitionId, minutes } = data;
    const competition = await competitionService.getDetails(competitionId);

    if (!competition) return;

    // Double check the competition is ending, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs(new Date() - (competition.endsAt - minutes * 60 * 1000)) > 10000) {
      return;
    }

    // Add all onCompetitionEnding actions below

    if (competition.groupId) {
      const period = minutes <= 60 ? { minutes } : { hours: minutes / 60 };
      events.dispatch('GroupCompetitionEnding', { competition, period });
    }
  }
};
