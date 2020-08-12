import * as groupService from '../../services/internal/competition.service';
import { Job } from '../index';

class AddToGroupCompetitions implements Job {
  name: string;

  constructor() {
    this.name = 'AddToGroupCompetitions';
  }

  async handle(data: any): Promise<void> {
    const { groupId, playerIds } = data;
    await groupService.addToGroupCompetitions(groupId, playerIds);
  }
}

export default new AddToGroupCompetitions();
