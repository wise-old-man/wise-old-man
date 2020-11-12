import api, { endpoints } from 'services/api';
import { reducers } from './reducer';
import { reducers as competitionReducers } from '../competitions/reducer';

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
  dispatch(reducers.onTrackRequest({ username }));

  try {
    const body = { username };
    const { data } = await api.post(endpoints.trackPlayer, body);

    // Side effect: Update this player's competitions participations
    dispatch(competitionReducers.onParticipantUpdated({ username }));

    return dispatch(reducers.onTrackSuccess({ username, data }));
  } catch (e) {
    return dispatch(reducers.onTrackError(e.response.data.message));
  }
};

const assertType = (username, playerId) => async dispatch => {
  dispatch(reducers.onAssertTypeRequest());

  try {
    const body = { username };
    const { data } = await api.post(endpoints.assertPlayerType, body);

    return dispatch(reducers.onAssertTypeSuccess({ username, playerId, playerType: data.type }));
  } catch (e) {
    return dispatch(reducers.onAssertTypeError(e.response.data.message));
  }
};

const assertName = (username, playerId) => async dispatch => {
  dispatch(reducers.onAssertNameRequest());

  try {
    const body = { username };
    const { data } = await api.post(endpoints.assertPlayerName, body);

    return dispatch(reducers.onAssertNameSuccess({ username, playerId, displayName: data.displayName }));
  } catch (e) {
    return dispatch(reducers.onAssertNameError(e.response.data.message));
  }
};

export { fetchPlayer, searchPlayers, trackPlayer, assertType, assertName };
