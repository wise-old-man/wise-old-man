import axios from 'axios';
import env from '../../env';

/**
 * Dispatch an event to our Discord Bot API.
 */
function dispatch(type, payload) {
  const url = env.DISCORD_BOT_API_URL;
  const api_token = env.DISCORD_BOT_API_TOKEN;
  const body = { type, api_token, data: payload };

  axios.post(url, body);
}

export default { dispatch };
