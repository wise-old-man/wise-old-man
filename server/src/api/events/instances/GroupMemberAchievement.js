const axios = require('axios');

module.exports = {
  key: 'GroupMemberAchievement',
  onDispatch({ groupId, player, achievement }) {
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = process.env;

    const body = {
      type: 'MEMBER_ACHIEVEMENT',
      data: { groupId, player, achievement },
      api_token: DISCORD_BOT_API_TOKEN
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
