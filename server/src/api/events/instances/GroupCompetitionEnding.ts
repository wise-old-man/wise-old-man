import axios from 'axios';

export default {
  key: 'GroupCompetitionEnding',
  onDispatch({ competition, period }) {
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = process.env;

    const body = {
      type: 'COMPETITION_ENDING',
      data: { groupId: competition.groupId, competition, period },
      api_token: DISCORD_BOT_API_TOKEN
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
