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

function fetchPlayerDeltasSuccess(playerId, data) {
  return {
    type: FETCH_PLAYER_DELTAS_SUCCESS,
    playerId,
    deltas: data
  };
}

function fetchPlayerDeltasFailure(error) {
  return {
    type: FETCH_PLAYER_DELTAS_FAILURE,
    error
  };
}

export default function fetchPlayerDeltas({ playerId, period }) {
  return dispatch => {
    dispatch(fetchPlayerDeltasRequest());

    const url = `${BASE_API_URL}/deltas/`;
    const params = { playerId, period };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchPlayerDeltasSuccess(playerId, result.data)))
      .catch(error => dispatch(fetchPlayerDeltasFailure(error)));
  };
}
