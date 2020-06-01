import * as playerService from '../../modules/players/player.service';

export default {
  key: 'AssertPlayerName',
  async handle({ data }) {
    const { username } = data;
    await playerService.assertName(username);
  }
};
