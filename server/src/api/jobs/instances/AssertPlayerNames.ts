import { assertName } from '../../modules/players/player.service';

export default {
  name: 'AssertPlayerName',
  async handle({ data }) {
    const { username } = data;
    await assertName(username);
  }
};
