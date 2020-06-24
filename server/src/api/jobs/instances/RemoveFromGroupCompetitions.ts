import { removeFromGroupCompetitions } from '../../modules/competitions/competition.service';

export default {
  name: 'RemoveFromGroupCompetitions',
  async handle({ data }) {
    const { groupId, playerIds } = data;
    await removeFromGroupCompetitions(groupId, playerIds);
  }
};
