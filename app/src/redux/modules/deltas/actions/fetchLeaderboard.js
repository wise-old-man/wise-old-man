import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_LEADERBOARD_REQUEST,
  FETCH_LEADERBOARD_SUCCESS,
  FETCH_LEADERBOARD_FAILURE
} from '../reducer';

function fetchLeaderboardRequest(period) {
  return { type: FETCH_LEADERBOARD_REQUEST, period };
}

function fetchLeaderboardSuccess(period, data) {
  return { type: FETCH_LEADERBOARD_SUCCESS, period, leaderboard: data };
}

function fetchLeaderboardFailure(period, error) {
  return { type: FETCH_LEADERBOARD_FAILURE, period, error };
}

export default function fetchLeaderboard(metric, period, playerType, playerBuild) {
  return dispatch => {
    dispatch(fetchLeaderboardRequest(period));

    const url = `${BASE_API_URL}/deltas/leaderboard/`;
    const params = { metric, period, playerType, playerBuild };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchLeaderboardSuccess(period, result.data)))
      .catch(error => dispatch(fetchLeaderboardFailure(period, error)));
  };
}
