import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchNameChanges = (username, status, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchRequest());

  try {
    const params = { username, status, limit, offset };
    const { data } = await api.get(endpoints.fetchNameChanges, { params });

    const refresh = !offset;

    dispatch(reducers.onFetchSuccess({ data, refresh }));
  } catch (e) {
    dispatch(reducers.onFetchError(e.message.toString()));
  }
};

const fetchPlayerNameChanges = username => async dispatch => {
  dispatch(reducers.onFetchPlayerNameChangesRequest());

  try {
    const url = endpoints.fetchPlayerNames.replace(':username', username);
    const { data } = await api.get(url);

    dispatch(reducers.onFetchPlayerNameChangesSuccess({ username, data }));
  } catch (e) {
    dispatch(reducers.onFetchPlayerNameChangesError(e.message.toString()));
  }
};

const fetchGroupNameChanges = (groupId, limit, offset) => async dispatch => {
  dispatch(reducers.onFetchGroupNameChangesRequest());

  try {
    const params = { limit, offset };
    const url = endpoints.fetchGroupNameChanges.replace(':id', groupId);

    const { data } = await api.get(url, { params });

    dispatch(reducers.onFetchGroupNameChangesSuccess({ groupId, data, refresh: !offset }));
  } catch (e) {
    dispatch(reducers.onFetchGroupNameChangesError(e.message.toString()));
  }
};

const submitNameChange = (oldName, newName) => async dispatch => {
  dispatch(reducers.onSubmitRequest());

  try {
    const body = { oldName, newName };
    const { data } = await api.post(endpoints.submitNameChange, body);

    return dispatch(reducers.onSubmitSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onSubmitError(e.response.data.message));
  }
};

export { fetchNameChanges, submitNameChange, fetchPlayerNameChanges, fetchGroupNameChanges };
