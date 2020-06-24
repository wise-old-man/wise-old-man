import { update } from '../../modules/players/player.service';

export default {
  name: 'UpdatePlayer',
  async handle({ data }) {
    const { username } = data;
    await update(username);
  }
};
