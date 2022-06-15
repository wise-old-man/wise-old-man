import { UpdateOptions } from 'sequelize/types';
import { Player } from '../database/models';

import { onPlayerNameChanged } from './modules/players/player.events';

function setup() {
  Player.afterUpdate((player: Player, options: UpdateOptions) => {
    if (!options.fields) return;

    if (options.fields.includes('username')) {
      onPlayerNameChanged(player, player.previous('displayName'));
    }
  });
}

export default { setup };
