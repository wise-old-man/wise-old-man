const axios = require('axios');
const services = require('../../constants/services.json');

module.exports = {
  key: 'GroupCompetitionEnded',
  onDispatch({ competition }) {
    const { groupId, participants } = competition;

    const standings = participants.map(({ displayName, progress }) => {
      return { displayName, gained: progress.gained };
    });

    const body = {
      type: 'COMPETITION_ENDED',
      data: { groupId, competition, standings },
      api_token: process.env.API_TOKEN
    };

    axios.post(services.DISCORD_BOT.API, body);
  }
};
