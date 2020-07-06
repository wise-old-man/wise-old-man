const axios = require('axios');
const services = require('../../constants/services.json');

module.exports = {
  key: 'GroupCompetitionCreated',
  onDispatch({ competition }) {
    const body = {
      type: 'COMPETITION_CREATED',
      data: { groupId: competition.groupId, competition },
      api_token: process.env.API_TOKEN
    };

    axios.post(services.DISCORD_BOT.API, body);
  }
};
