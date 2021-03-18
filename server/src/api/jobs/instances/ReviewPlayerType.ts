import logger from '../../services/external/logger.service';
import * as playerService from '../../services/internal/player.service';
import { Job } from '../index';

class ReviewPlayerType implements Job {
  name: string;

  constructor() {
    this.name = 'ReviewPlayerType';
  }

  async handle(data: any): Promise<void> {
    const { id } = data;

    const player = await playerService.findById(id);

    const previousType = player.type;
    const newType = await playerService.assertType(player);

    // Player type hasn't changed, player is just inactive
    if (previousType === newType) {
      return;
    }

    logger.info('De-ironed player', { username: player.username, previousType, newType });
  }
}

export default new ReviewPlayerType();
