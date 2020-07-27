import * as playerService from '../../modules/players/player.service';
import { Job } from '../index';

class AssertPlayerName implements Job {
  name: string;

  constructor() {
    this.name = 'AssertPlayerName';
  }

  async handle(data: any): Promise<void> {
    const { username } = data;
    await playerService.assertName(username);
  }
}

export default new AssertPlayerName();
