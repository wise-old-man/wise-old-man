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

function fetchCompetitionsSuccess(data, playerId) {
  return {
    type: FETCH_PLAYER_COMPETITIONS_SUCCESS,
    competitions: data,
    playerId
  };
}

function fetchCompetitionsFailure(error) {
  return {
    type: FETCH_PLAYER_COMPETITIONS_FAILURE,
    error
  };
}

export default function fetchCompetitions({ playerId }) {
  return dispatch => {
    dispatch(fetchCompetitionsRequest());

    const url = `${BASE_API_URL}/competitions/`;
    const params = { playerId };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchCompetitionsSuccess(result.data, playerId)))
      .catch(error => dispatch(fetchCompetitionsFailure(error)));
  };
}
