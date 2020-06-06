const playerService = require('../../modules/players/player.service');

module.exports = {
  name: 'UpdatePlayer',
  async handle({ data }) {
    const { player } = data;
    await playerService.update(player.username);
  }
};
