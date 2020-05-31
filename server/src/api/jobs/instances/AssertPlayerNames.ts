const playerService = require('../../modules/players/player.service');

module.exports = {
  key: 'AssertPlayerName',
  async handle({ data }) {
    const { username } = data;
    await playerService.assertName(username);
  }
};
