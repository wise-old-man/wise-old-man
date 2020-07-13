import axios from 'axios';
import env from '../../../env';

export default {
  key: 'GroupMembersJoined',
  onDispatch({ groupId, players }) {
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = env;

    const body = {
      type: 'GROUP_MEMBERS_JOINED',
      api_token: DISCORD_BOT_API_TOKEN,
      data: { groupId, players }
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
