const axios = require('axios');

module.exports = {
  key: 'GroupMembersJoined',
  onDispatch({ groupId, players }) {
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = process.env;

    const body = {
      type: 'GROUP_MEMBERS_JOINED',
      api_token: DISCORD_BOT_API_TOKEN,
      data: { groupId, players }
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
