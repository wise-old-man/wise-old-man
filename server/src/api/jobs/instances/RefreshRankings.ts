import * as competitionService from '../../modules/competitions/competition.service';
import * as groupService from '../../modules/groups/group.service';
import { Job } from '../index';

class RefreshRankings implements Job {
  name: string;

  constructor() {
    this.name = 'RefreshRankings';
  }

  async handle(): Promise<void> {
    await competitionService.refreshScores();
    await groupService.refreshScores();
  }
}

export default new RefreshRankings();
