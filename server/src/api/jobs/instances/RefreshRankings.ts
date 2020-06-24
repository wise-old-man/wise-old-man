import { refreshScores as groupScores } from '../../modules/groups/group.service';
import { refreshScores as competitionScores } from '../../modules/competitions/competition.service';

export default {
  name: 'RefreshRankings',
  async handle() {
    await groupScores();
    await competitionScores();
  }
};
