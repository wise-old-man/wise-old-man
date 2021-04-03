import axios from 'axios';
import { TEMPLE_OSRS } from '../../constants';
import { NotFoundError, ServerError } from '../../errors';

/**
 * Fetches the group members from the TempleOSRS API
 */
async function fetchGroupMembers(gid: number): Promise<string[]> {
  const URL = `${TEMPLE_OSRS.MEMBERS}?id=${gid}`;

  try {
    const { data } = await axios.get(URL);

    if (!data || !data.length) {
      throw new Error();
    }

    return data;
  } catch (e) {
    if (e.response?.status === 503) {
      throw new ServerError(`Failed to load TempleOSRS. Possible server failure on their end.`);
    } else {
      throw new NotFoundError(`Found no TempleOSRS members to import.`);
    }
  }
}

export { fetchGroupMembers };
