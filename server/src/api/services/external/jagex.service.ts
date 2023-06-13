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
async function fetchHiscoresData(username: string, type: PlayerType = PlayerType.REGULAR): Promise<string> {
  const proxy = proxiesService.getNextProxy();
  const url = `${OSRS_HISCORES_URLS[type]}?player=${username}`;

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
