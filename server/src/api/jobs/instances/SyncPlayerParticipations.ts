import * as competitionService from '../../services/internal/competition.service';
import { Job } from '../index';

class SyncPlayerParticipations implements Job {
  name: string;

  constructor() {
    this.name = 'SyncPlayerParticipations';
  }

  async handle(data: any): Promise<void> {
    const { playerId, latestSnapshot } = data;
    await competitionService.syncParticipations(playerId, latestSnapshot);
  }
}

export default new SyncPlayerParticipations();
