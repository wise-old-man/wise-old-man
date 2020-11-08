import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchGroupHiscores = (groupId, metric) => async dispatch => {
  dispatch(reducers.onFetchRequest());

  try {
    const url = endpoints.fetchGroupHiscores.replace(':id', groupId);
    const { data } = await api.get(url, { params: { metric } });

    dispatch(reducers.onFetchSuccess({ groupId, hiscores: data }));
  } catch (e) {
    dispatch(reducers.onFetchError(e.message.toString()));
  }
};

export { fetchGroupHiscores };
