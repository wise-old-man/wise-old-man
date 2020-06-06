const playerService = require('../../modules/players/player.service');

module.exports = {
  name: 'AssertPlayerName',
  async handle({ data }) {
    const { username } = data;
    await playerService.assertName(username);
  }
};
