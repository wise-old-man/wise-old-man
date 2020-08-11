import * as playerService from 'api/services/internal/player.service';
import { Job } from '../index';

class UpdatePlayer implements Job {
  name: string;

  constructor() {
    this.name = 'UpdatePlayer';
  }

  async handle(data: any): Promise<void> {
    const { username } = data;
    await playerService.update(username);
  }
}

export default new UpdatePlayer();
