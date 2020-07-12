const axios = require('axios');

module.exports = {
  key: 'GroupCompetitionEnded',
  onDispatch({ competition }) {
    const { groupId, participants } = competition;
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = process.env;

    const standings = participants.map(({ displayName, progress }) => {
      return { displayName, gained: progress.gained };
    });

    const body = {
      type: 'COMPETITION_ENDED',
      data: { groupId, competition, standings },
      api_token: DISCORD_BOT_API_TOKEN
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
