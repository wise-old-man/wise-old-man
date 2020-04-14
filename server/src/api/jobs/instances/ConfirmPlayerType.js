const playerService = require('../../modules/players/player.service');

module.exports = {
  key: 'ConfirmPlayerType',
  async handle({ data }) {
    const { player } = data;
    await playerService.confirmType(player.username);
  },
};
