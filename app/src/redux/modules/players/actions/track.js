import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import { TRACK_PLAYER_REQUEST, TRACK_PLAYER_SUCCESS, TRACK_PLAYER_FAILURE } from '../reducer';

function trackPlayerRequest(username) {
  return {
    type: TRACK_PLAYER_REQUEST,
    username,
  };
}

function trackPlayerSuccess(data, username) {
  Analytics.event({
    category: 'Player',
    action: 'Tracked player',
    value: username,
  });

  return {
    type: TRACK_PLAYER_SUCCESS,
    username,
    data,
  };
}

function trackPlayerFailure(error, username) {
  return {
    type: TRACK_PLAYER_FAILURE,
    username,
    error: error.response.data.message,
  };
}

export default function trackPlayer(username) {
  return dispatch => {
    dispatch(trackPlayerRequest(username));

    const url = `${BASE_API_URL}/players/track/`;
    const body = { username };

    return axios
      .post(url, body)
      .then(result => dispatch(trackPlayerSuccess(result.data, username)))
      .catch(error => dispatch(trackPlayerFailure(error, username)));
  };
}
