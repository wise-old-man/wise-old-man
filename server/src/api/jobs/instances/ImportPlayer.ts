import * as playerService from 'api/services/internal/player.service';
import { Job } from '../index';

class ImportPlayer implements Job {
  name: string;

  constructor() {
    this.name = 'ImportPlayer';
  }

  async handle(data: any): Promise<void> {
    const { username } = data;
    await playerService.importCML(username);
  }
}

export default new ImportPlayer();
