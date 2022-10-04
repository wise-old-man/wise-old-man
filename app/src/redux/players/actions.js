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
    const { data } = await api.post(endpoints.trackPlayer.replace(':username', username));

    // Side effect: Update this player's competitions participations
    dispatch(competitionReducers.onParticipantUpdated({ username }));

    return dispatch(reducers.onTrackSuccess({ username, data }));
  } catch (e) {
    return dispatch(reducers.onTrackError(e.response ? e.response.data.message : e.message.toString()));
  }
};

const assertType = username => async dispatch => {
  dispatch(reducers.onAssertTypeRequest());

  try {
    const { data } = await api.post(endpoints.assertPlayerType.replace(':username', username));

    return dispatch(
      reducers.onAssertTypeSuccess({
        username,
        playerType: data.player.type,
        changed: data.changed
      })
    );
  } catch (e) {
    return dispatch(reducers.onAssertTypeError(e.response.data.message));
  }
};

const assertName = (username, currentName) => async dispatch => {
  dispatch(reducers.onAssertNameRequest());

  try {
    const body = { username };
    const { data } = await api.post(endpoints.assertPlayerName, body);

    const changed = currentName !== data.displayName;

    return dispatch(reducers.onAssertNameSuccess({ username, displayName: data.displayName, changed }));
  } catch (e) {
    return dispatch(reducers.onAssertNameError(e.response.data.message));
  }
};

export { fetchPlayer, searchPlayers, trackPlayer, assertType, assertName };
