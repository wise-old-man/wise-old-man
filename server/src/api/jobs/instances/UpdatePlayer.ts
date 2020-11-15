import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class UpdatePlayer implements Job {
  name: string;

  constructor() {
    this.name = 'UpdatePlayer';
  }

  async handle(data: any): Promise<void> {
    if (!data.username) return;
    await playerService.update(data.username);
  }
}

export default new UpdatePlayer();
