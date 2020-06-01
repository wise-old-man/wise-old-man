import * as playerService from '../../modules/players/player.service';

export default {
  key: 'UpdatePlayer',
  async handle({ data }) {
    const { player } = data;
    await playerService.update(player.username);
  }
}