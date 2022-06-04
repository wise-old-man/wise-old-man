import axios from 'axios';
import { PlayerType } from '../../../utils';
import { BadRequestError, ServerError } from '../../errors';
import proxiesService from './proxies.service';

export const OSRS_HISCORES_URLS = {
  regular: 'https://services.runescape.com/m=hiscore_oldschool/index_lite.ws',
  ironman: 'https://services.runescape.com/m=hiscore_oldschool_ironman/index_lite.ws',
  hardcore: 'https://services.runescape.com/m=hiscore_oldschool_hardcore_ironman/index_lite.ws',
  ultimate: 'https://services.runescape.com/m=hiscore_oldschool_ultimate/index_lite.ws'
};

/**
 * Fetches the player data from the Hiscores API.
 */
async function getHiscoresData(username: string, type: PlayerType = PlayerType.REGULAR): Promise<string> {
  const proxy = proxiesService.getNextProxy();
  const URL = `${OSRS_HISCORES_URLS[type]}?player=${username}`;

  try {
    // Fetch the data through the API Url
    const { data } = await axios({ url: proxy ? URL.replace('https', 'http') : URL, proxy });

    // Validate the response data
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

export { getHiscoresData };
