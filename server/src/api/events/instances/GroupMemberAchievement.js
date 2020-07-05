const axios = require('axios');
const services = require('../../constants/services.json');

module.exports = {
  key: 'GroupMemberAchievement',
  onDispatch({ groupId, player, achievement }) {
    const body = {
      type: 'MEMBER_ACHIEVEMENT',
      data: { groupId, player, achievement },
      api_token: process.env.API_TOKEN
    };

    axios.post(services.DISCORD_BOT.API, body);
  }
};
