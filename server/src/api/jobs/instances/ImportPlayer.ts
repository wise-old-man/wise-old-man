import * as playerService from '../../modules/players/player.service';

export default {
  key: 'ImportPlayer',
  async handle({ data }) {
    const { player } = data;
    await playerService.importCML(player.username);
  },
  onFail() {}
};
