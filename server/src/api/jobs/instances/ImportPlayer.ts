import * as playerService from '../../modules/players/player.service';

export default {
  name: 'ImportPlayer',
  async handle({ data }) {
    const { username } = data;
    await playerService.importCML(username);
  }
};
