import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class UpdatePlayer implements Job {
  name: string;

  constructor() {
    this.name = 'UpdatePlayer';
  }

  async handle(data: any): Promise<void> {
    const { username } = data;

    if (!username) return;

    await playerService.update(username);
  }
}

export default new UpdatePlayer();
