import { importCML } from '../../modules/players/player.service';

export default {
  name: 'ImportPlayer',
  async handle({ data }) {
    const { username } = data;
    await importCML(username);
  }
};
