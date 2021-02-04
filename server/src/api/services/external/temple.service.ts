import axios from 'axios';
import { TEMPLE_OSRS } from '../../constants';
import { NotFoundError } from '../../errors';

/**
 * Fetches the group members from the temple API
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
    throw new NotFoundError(`Found no members to import`);
  }
}

export { fetchGroupMembers };
