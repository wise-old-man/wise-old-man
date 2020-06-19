const playerService = require('../../modules/players/player.service');

module.exports = {
  name: 'ImportPlayer',
  async handle({ data }) {
    const { username } = data;
    await playerService.importCML(username);
  }
};
