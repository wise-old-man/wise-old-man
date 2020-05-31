const playerService = require('../../modules/players/player.service');

import 

export default {
  key: 'UpdatePlayer',
  async handle({ data }) {
    const { player } = data;
    await playerService.update(player.username);
  }
}