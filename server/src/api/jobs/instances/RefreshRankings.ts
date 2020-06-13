import * as groupService from '../../modules/groups/group.service';
import * as competitionService from '../../modules/competitions/competition.service';

export default {
  name: 'RefreshRankings',
  async handle() {
    await groupService.refreshScores();
    await competitionService.refreshScores();
  }
};
