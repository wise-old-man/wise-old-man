import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class AssertPlayerName implements Job {
  name: string;

  constructor() {
    this.name = 'AssertPlayerName';
  }

  async handle(data: any): Promise<void> {
    const player = await playerService.resolve({ id: data.id });
    await playerService.assertName(player);
  }
}

export default new AssertPlayerName();
