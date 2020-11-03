import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchRates = (metric = 'ehp', type = 'main') => async dispatch => {
  dispatch(reducers.onFetchRequest());

  try {
    const params = { metric, type };
    const { data } = await api.get(endpoints.fetchRates, { params });

    dispatch(reducers.onFetchSuccess({ metric, rates: data }));
  } catch (e) {
    dispatch(reducers.onFetchError(e.message.toString()));
  }
};

export { fetchRates };
