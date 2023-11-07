import axios from 'axios';
import { BadRequestError, ServerError } from '../../errors';
import proxiesService from './proxies.service';

const RUNEMETRICS_URL = 'https://apps.runescape.com/runemetrics/profile/profile';

const OSRS_LEAGUE_HISCORES_URL = 'https://services.runescape.com/m=hiscore_oldschool_seasonal/index_lite.ws';

async function checkIsBanned(username: string) {
  const proxy = proxiesService.getNextProxy();
  const url = `${RUNEMETRICS_URL}?user=${username}`;

  try {
    const { data } = await axios({
      url: proxy ? url.replace('https', 'http') : url,
      proxy
    });

    return 'error' in data && data.error === 'NOT_A_MEMBER';
  } catch (e) {
    return false;
  }
}

/**
 * Fetches the player data from the Hiscores API.
 */
async function fetchHiscoresData(username: string): Promise<string> {
  const proxy = proxiesService.getNextProxy();
  const url = `${OSRS_LEAGUE_HISCORES_URL}?player=${username}`;

  try {
    const { data } = await axios({
      url: proxy ? url.replace('https', 'http') : url,
      proxy
    });

    if (!data || !data.length || data.includes('Unavailable') || data.includes('<')) {
      throw new ServerError('Failed to load hiscores: Jagex service is unavailable');
    }

    return data;
  } catch (e) {
    if (e instanceof ServerError) throw e;

    if (e.response && e.response.status === 404) {
      throw new BadRequestError('Failed to load hiscores: Invalid username.');
    } else {
      throw new ServerError('Failed to load hiscores: Connection refused.');
    }
  }
}

export { fetchHiscoresData, checkIsBanned };
