import * as competitionService from '../../modules/competitions/competition.service';

export default {
  name: 'RemoveFromGroupCompetitions',
  async handle({ data }) {
    const { groupId, playerIds } = data;
    await competitionService.removeFromGroupCompetitions(groupId, playerIds);
  }
};
