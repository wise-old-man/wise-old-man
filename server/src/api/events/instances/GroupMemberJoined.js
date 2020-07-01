const axios = require('axios');
const services = require('../../constants/services.json');

module.exports = {
  key: 'GroupMemberJoined',
  onDispatch({ groupId, playerId, displayName }) {
    const body = {
      type: 'GROUP_MEMBER_JOINED',
      data: { groupId, playerId, displayName }
    };

    axios.post(services.DISCORD_BOT.API, body);
  }
};
