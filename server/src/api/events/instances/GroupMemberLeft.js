const axios = require('axios');

module.exports = {
  key: 'GroupMemberLeft',
  onDispatch({ groupId, playerId, displayName }) {
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = process.env;

    const body = {
      type: 'GROUP_MEMBER_LEFT',
      data: { groupId, playerId, displayName },
      api_token: DISCORD_BOT_API_TOKEN
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
