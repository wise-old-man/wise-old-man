import axios from 'axios';
import cheerio from 'cheerio';
import tableParser from 'cheerio-tableparser';
import { OSRS_HISCORES } from '../../constants';
import { BadRequestError, ServerError } from '../../errors';
import proxiesService from './proxies.service';

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
    if (!data || !data.length || data.includes('Unavailable')) {
      throw new ServerError('Failed to load hiscores: Service is unavailable');
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
      responseType: 'arraybuffer'
    });

    // Validate the response data
    if (!data || !data.length || data.includes('Unavailable')) {
      throw new ServerError('Failed to load hiscores: Service is unavailable');
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
