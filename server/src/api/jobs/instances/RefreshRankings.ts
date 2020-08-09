import * as competitionService from '@services/internal/competitions';
import * as groupService from '@services/internal/groups';
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
