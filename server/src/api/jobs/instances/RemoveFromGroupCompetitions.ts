import { removeFromGroupCompetitions } from '@services/internal/competitions';
import { Job } from '../index';

class RemoveFromGroupCompetitions implements Job {
  name: string;

  constructor() {
    this.name = 'RemoveFromGroupCompetitions';
  }

  async handle(data: any): Promise<void> {
    const { groupId, playerIds } = data;
    await removeFromGroupCompetitions(groupId, playerIds);
  }
}

export default new RemoveFromGroupCompetitions();
