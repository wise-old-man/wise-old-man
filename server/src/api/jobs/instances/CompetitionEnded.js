const events = require('../../events');
const competitionService = require('../../modules/competitions/competition.service');

module.exports = {
  name: 'CompetitionEnded',
  async handle({ data }) {
    const { competitionId } = data;
    const competition = await competitionService.getDetails(competitionId);

    if (!competition) return;

    // Double check the competition just ended, since the
    // competition start date can be changed between the
    // scheduling and execution of this job
    if (Math.abs(new Date() - competition.endsAt) > 10000) {
      return;
    }

    // Add all onCompetitionEnded actions below

    if (competition.groupId) {
      events.dispatch('GroupCompetitionEnded', { competition });
    }
  }
};
