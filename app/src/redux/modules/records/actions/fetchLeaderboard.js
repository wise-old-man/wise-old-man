import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import { FETCH_LEADERBOARD_REQUEST, FETCH_LEADERBOARD_SUCCESS, FETCH_LEADERBOARD_FAILURE } from '../reducer';

function fetchLeaderboardRequest() {
  return {
    type: FETCH_LEADERBOARD_REQUEST
  };
}

function fetchLeaderboardSuccess(data) {
  return {
    type: FETCH_LEADERBOARD_SUCCESS,
    leaderboard: data
  };
}

function fetchLeaderboardFailure(error) {
  return {
    type: FETCH_LEADERBOARD_FAILURE,
    error
  };
}

export default function fetchLeaderboard({ metric, playerType }) {
  return dispatch => {
    dispatch(fetchLeaderboardRequest());

    const url = `${BASE_API_URL}/records/leaderboard/`;
    const params = { metric, playerType };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchLeaderboardSuccess(result.data)))
      .catch(error => dispatch(fetchLeaderboardFailure(error)));
  };
}
