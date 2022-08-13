import axios from 'axios';
import * as cheerio from 'cheerio';
import { NotFoundError, ServerError } from '../../errors';
import { CMLGroupData } from '../../modules/groups/group.types';

const HISTORY_URL = 'https://crystalmathlabs.com/tracker/api.php?type=datapoints';
const GROUP_INFO_URL = 'https://www.crystalmathlabs.com/tracker/virtualhiscores.php?page=statistics';

/**
 * Fetches the player history from the CML API.
 */
async function getCMLHistory(username: string, time: number): Promise<string[]> {
  const URL = `${HISTORY_URL}&player=${username}&time=${time}`;

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

async function fetchGroupInfo(id: number): Promise<CMLGroupData> {
  const URL = `${GROUP_INFO_URL}&group=${id}`;

  try {
    const { data } = await axios.get(URL);

    if (!data || !data.length) {
      throw new Error();
    }

    const $ = cheerio.load(data.toString('latin1'));

    const pageLinks = $('#contentwrap > #content')
      .find('a')
      .toArray()
      .map(e => $(e));

    const playerLinks = pageLinks.filter(e => e.attr('href').startsWith('track.php'));

    if (!playerLinks || playerLinks.length === 0) {
      throw new Error();
    }

    const playerNames = [...new Set(playerLinks.map(e => e.text()))];

    const linkSplit = pageLinks[0].text().split('Create competition from');

    if (!linkSplit || linkSplit.length !== 2) {
      throw new Error();
    }

    const groupName = linkSplit[1].trim();

    return { name: groupName, members: playerNames };
  } catch (error) {
    throw new NotFoundError('Found no CrystalMathLabs members to import.');
  }
}

export { getCMLHistory, fetchGroupInfo };
