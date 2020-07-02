const playerService = require('../../modules/players/player.service');

module.exports = {
  name: 'UpdatePlayer',
  async handle({ data }) {
    const { username } = data;
    await playerService.update(username);
  }
};
