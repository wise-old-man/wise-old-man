const axios = require('axios');
const services = require('../../constants/services.json');

module.exports = {
  key: 'GroupCompetitionStarted',
  onDispatch({ competition }) {
    const body = {
      type: 'COMPETITION_STARTED',
      data: { groupId: competition.groupId, competition }
    };

    axios.post(services.DISCORD_BOT.API, body);
  }
};
