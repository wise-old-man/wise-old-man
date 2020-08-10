import * as competitionService from 'api/services/internal/competitions';
import * as groupService from 'api/services/internal/groups';
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
