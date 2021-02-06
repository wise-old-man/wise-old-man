import axios from 'axios';
import cheerio from 'cheerio';
import { CML } from '../../constants';
import { NotFoundError, ServerError } from '../../errors';

/**
 * Fetches the player history from the CML API.
 */
async function getCMLHistory(username: string, time: number): Promise<string[]> {
  const URL = `${CML.HISTORY}&player=${username}&time=${time}`;

  try {
    // Fetch the data through the API Url
    const { data } = await axios.get(URL);

    // Validate the response data
    if (!data || !data.length || data === '-1') {
      throw new Error();
    }

    // Separate the data into rows and filter invalid ones
    return data.split('\n').filter(r => r.length);
  } catch (e) {
    throw new ServerError('Failed to load history from CML.');
  }
}

/**
 * Fetches the player history from the CML API.
 */
async function fetchGroupMembers(gid: number): Promise<string[]> {
  const URL = `${CML.MEMBERS}?group=${gid}`;

  try {
    const { data } = await axios.get(URL);

    if (!data || !data.length) {
      throw new Error();
    }

    const $: any = cheerio.load(data.toString('latin1'));
    const players = $('textarea[name=players]').val();

    if (!players) {
      throw new Error();
    }

    return players.split('\n').filter(n => !!n);
  } catch (e) {
    throw new NotFoundError('Found no members to import');
  }
}

export { getCMLHistory, fetchGroupMembers };
