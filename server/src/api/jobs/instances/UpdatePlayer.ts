import * as playerService from '../../modules/players/player.service';

export default {
  name: 'UpdatePlayer',
  async handle({ data }) {
    const { username } = data;
    await playerService.update(username);
  }
};
