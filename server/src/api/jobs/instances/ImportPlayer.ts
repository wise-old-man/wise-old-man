const playerService = require('../../modules/players/player.service');

module.exports = {
  key: 'ImportPlayer',
  async handle({ data }) {
    const { player } = data;
    await playerService.importCML(player.username);
  },
  onFail() {}
};
