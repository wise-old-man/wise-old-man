const axios = require('axios');
const services = require('../../constants/services.json');

module.exports = {
  key: 'GroupCompetitionStarting',
  onDispatch({ competition, period }) {
    const body = {
      type: 'COMPETITION_STARTING',
      data: { groupId: competition.groupId, competition, period },
      api_token: process.env.API_TOKEN
    };

    axios.post(services.DISCORD_BOT.API, body);
  }
};
