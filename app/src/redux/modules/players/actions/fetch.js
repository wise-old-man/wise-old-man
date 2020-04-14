import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import { FETCH_PLAYER_REQUEST, FETCH_PLAYER_SUCCESS, FETCH_PLAYER_FAILURE } from '../reducer';

function fetchPlayerRequest() {
  return {
    type: FETCH_PLAYER_REQUEST,
  };
}

function fetchPlayerSuccess(data) {
  return {
    type: FETCH_PLAYER_SUCCESS,
    player: data,
  };
}

function fetchPlayerFailure(error) {
  return {
    type: FETCH_PLAYER_FAILURE,
    error,
  };
}

export default function fetchPlayer({ id, username }) {
  return dispatch => {
    dispatch(fetchPlayerRequest());

    const url = `${BASE_API_URL}/players/`;
    const params = { id, username };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchPlayerSuccess(result.data)))
      .catch(error => dispatch(fetchPlayerFailure(error)));
  };
}
