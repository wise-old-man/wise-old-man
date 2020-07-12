const axios = require('axios');

module.exports = {
  key: 'GroupCompetitionStarted',
  onDispatch({ competition }) {
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = process.env;

    const body = {
      type: 'COMPETITION_STARTED',
      data: { groupId: competition.groupId, competition },
      api_token: DISCORD_BOT_API_TOKEN
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
