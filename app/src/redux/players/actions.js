import api, { endpoints } from 'services/api';
import { reducers } from './reducer';

const fetchPlayer = username => async dispatch => {
  dispatch(reducers.onFetchRequest());

  try {
    const url = endpoints.fetchPlayerDetails.replace(':username', username);
    const { data } = await api.get(url);

    return dispatch(reducers.onFetchSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onFetchError(e.message.toString()));
  }
};

const searchPlayers = username => async dispatch => {
  dispatch(reducers.onSearchRequest());

  try {
    const params = { username };
    const { data } = await api.get(endpoints.searchPlayers, { params });

    return dispatch(reducers.onSearchSuccess({ data }));
  } catch (e) {
    return dispatch(reducers.onSearchError(e.message.toString()));
  }
};

const trackPlayer = username => async dispatch => {
  dispatch(reducers.onTrackRequest());

  try {
    const body = { username };
    const { data } = await api.post(endpoints.trackPlayer, body);

    return dispatch(reducers.onTrackSuccess({ username, data }));
  } catch (e) {
    return dispatch(reducers.onTrackError(e.message.toString()));
  }
};

const assertType = (username, playerId) => async dispatch => {
  dispatch(reducers.onAssertTypeRequest());

  try {
    const body = { username };
    const { data } = await api.post(endpoints.assertPlayerType, body);

    return dispatch(reducers.onAssertTypeSuccess({ username, playerId, playerType: data.type }));
  } catch (e) {
    return dispatch(reducers.onAssertTypeError(e.message.toString()));
  }
};

const assertName = (username, playerId) => async dispatch => {
  dispatch(reducers.onAssertNameRequest());

  try {
    const body = { username };
    const { data } = await api.post(endpoints.assertPlayerName, body);

    return dispatch(reducers.onAssertNameSuccess({ username, playerId, displayName: data.displayName }));
  } catch (e) {
    return dispatch(reducers.onAssertNameError(e.message.toString()));
  }
};

export { fetchPlayer, searchPlayers, trackPlayer, assertType, assertName };
