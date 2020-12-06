import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchGroupHiscores = (groupId, metric, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchRequest());

  try {
    const url = endpoints.fetchGroupHiscores.replace(':id', groupId);
    const params = { metric, limit, offset };

    const { data } = await api.get(url, { params });

    dispatch(reducers.onFetchSuccess({ groupId, hiscores: data, refresh: !offset }));
  } catch (e) {
    dispatch(reducers.onFetchError(e.message.toString()));
  }
};

export { fetchGroupHiscores };
