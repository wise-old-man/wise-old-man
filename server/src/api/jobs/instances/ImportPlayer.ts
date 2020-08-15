import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class ImportPlayer implements Job {
  name: string;

  constructor() {
    this.name = 'ImportPlayer';
  }

  async handle(data: any): Promise<void> {
    const { playerId, username } = data;

    // If the player id is supplied instead of the username
    // fetch the user data from the id, and then import from username
    if (playerId) {
      const player = await playerService.findById(playerId);

      if (player) {
        await playerService.importCML(player.username);
      }
    } else {
      await playerService.importCML(username);
    }
  }
}

export default new ImportPlayer();
