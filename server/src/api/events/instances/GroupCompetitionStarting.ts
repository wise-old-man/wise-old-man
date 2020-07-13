import axios from 'axios';
import env from '../../../env';

export default {
  key: 'GroupCompetitionStarting',
  onDispatch({ competition, period }) {
    const { DISCORD_BOT_API_URL, DISCORD_BOT_API_TOKEN } = env;

    const body = {
      type: 'COMPETITION_STARTING',
      data: { groupId: competition.groupId, competition, period },
      api_token: DISCORD_BOT_API_TOKEN
    };

    axios.post(DISCORD_BOT_API_URL, body);
  }
};
