const playerService = require('../../modules/players/player.service');

module.exports = {
  key: 'UpdatePlayer',
  async handle({ data }) {
    const { player } = data;
    await playerService.update(player.username);
  }
};
