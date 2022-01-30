import axios from 'axios';
import { MigratedGroupInfo } from '../../../types';
import { TEMPLE_OSRS } from '../../constants';
import { NotFoundError, ServerError } from '../../errors';

/**
 * Fetches the group members from the TempleOSRS API
 */
async function fetchGroupInfo(gid: number): Promise<MigratedGroupInfo> {
  const URL = `${TEMPLE_OSRS.GROUP_INFO}?id=${gid}`;

  try {
    const { data } = await axios.get(URL);

    if (!data) {
      throw new Error();
    }

    const { members, leaders, info } = data.data;
    const { name } = info;

    return { members, leaders, name };
  } catch (e) {
    if (e.response?.status === 503) {
      throw new ServerError(`Failed to load TempleOSRS. Possible server failure on their end.`);
    } else {
      throw new NotFoundError(`Found no TempleOSRS members to import.`);
    }
  }
}

export { fetchGroupInfo };
