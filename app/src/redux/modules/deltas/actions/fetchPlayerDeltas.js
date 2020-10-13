import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_PLAYER_DELTAS_REQUEST,
  FETCH_PLAYER_DELTAS_SUCCESS,
  FETCH_PLAYER_DELTAS_FAILURE
} from '../reducer';

function fetchPlayerDeltasRequest() {
  return {
    type: FETCH_PLAYER_DELTAS_REQUEST
  };
}

function fetchPlayerDeltasSuccess(username, data) {
  return {
    type: FETCH_PLAYER_DELTAS_SUCCESS,
    username,
    deltas: data
  };
}

function fetchPlayerDeltasFailure(error) {
  return {
    type: FETCH_PLAYER_DELTAS_FAILURE,
    error
  };
}

export default function fetchPlayerDeltas({ username, period }) {
  return dispatch => {
    dispatch(fetchPlayerDeltasRequest());

    const url = `${BASE_API_URL}/players/username/${username}/gained`;
    const params = { period };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchPlayerDeltasSuccess(username, result.data)))
      .catch(error => dispatch(fetchPlayerDeltasFailure(error)));
  };
}
