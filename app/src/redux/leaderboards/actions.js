import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchLeaderboards = (query, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchRequest());

  try {
    const params = { ...query, limit, offset };
    const { data } = await api.get(endpoints.fetchLeaderboards, { params });

    const refresh = !offset;

    dispatch(reducers.onFetchSuccess({ data, refresh }));
  } catch (e) {
    dispatch(reducers.onFetchError(e.message.toString()));
  }
};

export { fetchLeaderboards };
