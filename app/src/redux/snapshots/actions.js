import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchSnapshots = (username, period, startDate, endDate) => async dispatch => {
  dispatch(reducers.onFetchRequest());

  try {
    const url = endpoints.fetchPlayerSnapshots.replace(':username', username);
    const { data } = await api.get(url, { params: { period, startDate, endDate } });

    dispatch(reducers.onFetchSuccess({ username, period, data }));
  } catch (e) {
    dispatch(reducers.onFetchError(e.message.toString()));
  }
};

export { fetchSnapshots };
