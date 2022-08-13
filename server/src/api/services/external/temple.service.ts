import axios from 'axios';
import { NotFoundError, ServerError } from '../../errors';
import { TempleGroupData } from '../../modules/groups/group.types';

const GROUP_INFO_URL = 'https://templeosrs.com/api/group_info.php';

/**
 * Fetches the group members from the TempleOSRS API
 */
async function fetchGroupInfo(gid: number): Promise<TempleGroupData> {
  const URL = `${GROUP_INFO_URL}?id=${gid}`;

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
