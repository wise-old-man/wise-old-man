import axios from 'axios';
import cheerio from 'cheerio';
import tableParser from 'cheerio-tableparser';
import { OSRS_HISCORES } from '../../constants';
import { BadRequestError, ServerError } from '../../errors';
import proxiesService from './proxies.service';

const SCRAPING_HEADERS = {
  Host: 'secure.runescape.com',
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.66 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'Accept-Encoding': 'gzip, deflate, br',
  'Accept-Language': 'pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7,la;q=0.6,es;q=0.5'
};

/**
 * Fetches the player data from the Hiscores API.
 */
async function getHiscoresData(username: string, type = 'regular'): Promise<string> {
  const proxy = proxiesService.getNextProxy();
  const URL = `${OSRS_HISCORES[type]}?player=${username}`;

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
    throw new BadRequestError('Failed to load hiscores: Invalid username.');
  }
}

/**
 * Fetches the OSRS hiscores website to get all names of the table
 * where "username" is listed in.
 */
async function getHiscoresNames(username: string): Promise<string[]> {
  const proxy = proxiesService.getNextProxy();
  const URL = `${OSRS_HISCORES.nameCheck}&user=${username}`;

  try {
    // Fetch the data through the API Url
    const { data } = await axios({
      url: proxy ? URL.replace('https', 'http') : URL,
      proxy,
      responseType: 'arraybuffer',
      withCredentials: true,
      headers: SCRAPING_HEADERS
    });

    // Validate the response data
    if (!data || !data.length || data.includes('Unavailable')) {
      throw new ServerError('Failed to load hiscores: Jagex service is unavailable');
    }

    return getHiscoresTableNames(data.toString('latin1'));
  } catch (e) {
    if (e instanceof ServerError) throw e;
    throw new BadRequestError('Failed to load hiscores: Invalid username.');
  }
}

function getHiscoresTableNames(data: string): string[] {
  const $: any = cheerio.load(data);
  tableParser($);

  const tableData = $('table').parsetable(false, false, true);

  if (!tableData || tableData.length < 2) {
    return [];
  }

  return tableData[1];
}

export { getHiscoresData, getHiscoresNames };
