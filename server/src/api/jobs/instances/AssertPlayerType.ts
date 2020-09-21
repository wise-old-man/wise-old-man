import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class AssertPlayerType implements Job {
  name: string;

  constructor() {
    this.name = 'AssertPlayerType';
  }

  async handle(data: any): Promise<void> {
    const player = await playerService.resolve({ id: data.id });
    await playerService.assertType(player);
  }
}

export default new AssertPlayerType();
