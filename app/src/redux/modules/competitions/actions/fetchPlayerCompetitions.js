import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_PLAYER_COMPETITIONS_REQUEST,
  FETCH_PLAYER_COMPETITIONS_SUCCESS,
  FETCH_PLAYER_COMPETITIONS_FAILURE
} from '../reducer';

function fetchCompetitionsRequest() {
  return {
    type: FETCH_PLAYER_COMPETITIONS_REQUEST
  };
}

function fetchCompetitionsSuccess(data, username) {
  return {
    type: FETCH_PLAYER_COMPETITIONS_SUCCESS,
    competitions: data,
    username
  };
}

function fetchCompetitionsFailure(error) {
  return {
    type: FETCH_PLAYER_COMPETITIONS_FAILURE,
    error
  };
}

export default function fetchCompetitions({ username }) {
  return dispatch => {
    dispatch(fetchCompetitionsRequest());

    const url = `${BASE_API_URL}/players/username/${username}/competitions/`;

    return axios
      .get(url)
      .then(result => dispatch(fetchCompetitionsSuccess(result.data, username)))
      .catch(error => dispatch(fetchCompetitionsFailure(error)));
  };
}
