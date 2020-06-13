import * as competitionService from '../../modules/competitions/competition.service';

export default {
  key: 'AddToGroupCompetitions',
  async handle({ data }) {
    const { groupId, playerIds } = data;
    await competitionService.addToGroupCompetitions(groupId, playerIds);
  }
};
