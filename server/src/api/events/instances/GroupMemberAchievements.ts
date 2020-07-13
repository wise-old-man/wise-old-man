import axios from 'axios';
import env from '../../../env';

export default {
  key: 'GroupMemberAchievements',
  onDispatch({ groupId, player, achievements }) {
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = env;

    const body = {
      type: 'MEMBER_ACHIEVEMENTS',
      api_token: DISCORD_BOT_API_TOKEN,
      data: { groupId, player, achievements }
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
