import { addToGroupCompetitions } from '../../modules/competitions/competition.service';

export default {
  name: 'AddToGroupCompetitions',
  async handle({ data }) {
    const { groupId, playerIds } = data;
    await addToGroupCompetitions(groupId, playerIds);
  }
};
