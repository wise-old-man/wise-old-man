const axios = require('axios');
const services = require('../../constants/services.json');

module.exports = {
  key: 'GroupMemberLeft',
  onDispatch({ groupId, playerId, displayName }) {
    const body = {
      type: 'GROUP_MEMBER_LEFT',
      data: { groupId, playerId, displayName },
      api_token: process.env.API_TOKEN
    };

    axios.post(services.DISCORD_BOT.API, body);
  }
};
