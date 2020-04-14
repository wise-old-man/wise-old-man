import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import { SEARCH_PLAYERS_REQUEST, SEARCH_PLAYERS_SUCCESS, SEARCH_PLAYERS_FAILURE } from '../reducer';

function searchPlayersRequest() {
  return {
    type: SEARCH_PLAYERS_REQUEST,
  };
}

function searchPlayersSuccess(data) {
  return {
    type: SEARCH_PLAYERS_SUCCESS,
    players: data,
  };
}

function searchPlayersFailure(error) {
  return {
    type: SEARCH_PLAYERS_FAILURE,
    error,
  };
}

export default function searchPlayers({ username }) {
  return dispatch => {
    dispatch(searchPlayersRequest());

    const url = `${BASE_API_URL}/players/search/`;
    const params = { username };

    return axios
      .get(url, { params })
      .then(result => dispatch(searchPlayersSuccess(result.data)))
      .catch(error => dispatch(searchPlayersFailure(error)));
  };
}
