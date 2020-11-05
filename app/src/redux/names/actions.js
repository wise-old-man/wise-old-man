import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchNameChanges = (limit, offset) => async dispatch => {
  dispatch(reducers.onFetchRequest());

  try {
    const params = { limit, offset };
    const { data } = await api.get(endpoints.fetchNameChanges, { params });

    const refresh = !offset;

    dispatch(reducers.onFetchSuccess({ data, refresh }));
  } catch (e) {
    dispatch(reducers.onFetchError(e.message.toString()));
  }
};

const submitNameChange = (oldName, newName) => async dispatch => {
  dispatch(reducers.onSubmitRequest());

  try {
    const body = { oldName, newName };
    const { data } = await api.post(endpoints.submitNameChange, body);

    return dispatch(reducers.onSubmitSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onFetchError(e));
  }
};

export { fetchNameChanges, submitNameChange };
