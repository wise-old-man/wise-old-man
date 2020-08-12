import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class AssertPlayerType implements Job {
  name: string;

  constructor() {
    this.name = 'AssertPlayerType';
  }

  async handle(data: any): Promise<void> {
    const { username } = data;
    await playerService.assertType(username, true);
  }
}

export default new AssertPlayerType();
