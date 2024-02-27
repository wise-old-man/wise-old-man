import axios from 'axios';
import { PlayerType } from '../../../utils';
import { BadRequestError, ServerError } from '../../errors';
import proxiesService from './proxies.service';

const RUNEMETRICS_URL = 'https://apps.runescape.com/runemetrics/profile/profile';

export const OSRS_HISCORES_URLS = {
  [PlayerType.REGULAR]: 'https://services.runescape.com/m=hiscore_oldschool/index_lite.ws',
  [PlayerType.IRONMAN]: 'https://services.runescape.com/m=hiscore_oldschool_ironman/index_lite.ws',
  [PlayerType.HARDCORE]: 'https://services.runescape.com/m=hiscore_oldschool_hardcore_ironman/index_lite.ws',
  [PlayerType.ULTIMATE]: 'https://services.runescape.com/m=hiscore_oldschool_ultimate/index_lite.ws'
};

async function checkIsBanned(username: string) {
  const url = `${RUNEMETRICS_URL}?user=${username}`;

  try {
    const data = await fetchWithProxy(url);
    return 'error' in data && data.error === 'NOT_A_MEMBER';
  } catch (e) {
    return false;
  }
}

/**
 * Fetches the player data from the Hiscores API.
 */
async function fetchHiscoresData(username: string, type: PlayerType = PlayerType.REGULAR): Promise<string> {
  const hiscoresType = type === PlayerType.UNKNOWN ? PlayerType.REGULAR : type;

  const url = `${OSRS_HISCORES_URLS[hiscoresType]}?player=${username}`;

  try {
    const data = await fetchWithProxy(url);

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

async function fetchWithProxy(url: string) {
  const MAX_RETRIES = 3;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    const proxy = proxiesService.getNextProxy();

    try {
      const { data } = await axios({
        url: proxy != null ? url.replace('https', 'http') : url,
        proxy: proxy != null ? proxy : false
      });

      return data;
    } catch (error) {
      // If a proxy request fails with ECONNREFUSED, try again (up to 3 times)
      // with a different proxy and wait 1000 milliseconds in between attempts.
      if (proxy && 'code' in error && error.code === 'ECONNREFUSED') {
        retries++;
        await new Promise(r => setTimeout(r, 1000)); // Sleep for 1s
      } else {
        throw error;
      }
    }
  }
}

export { fetchHiscoresData, checkIsBanned };
