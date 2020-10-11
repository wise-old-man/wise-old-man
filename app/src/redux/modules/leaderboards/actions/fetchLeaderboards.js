import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_LEADERBOARDS_REQUEST,
  FETCH_LEADERBOARDS_SUCCESS,
  FETCH_LEADERBOARDS_FAILURE
} from '../reducer';

function fetchLeaderboardsRequest() {
  return {
    type: FETCH_LEADERBOARDS_REQUEST
  };
}

function fetchLeaderboardsSuccess(data, refresh) {
  return {
    type: FETCH_LEADERBOARDS_SUCCESS,
    leaderboards: data,
    refresh
  };
}

function fetchLeaderboardsFailure(error) {
  return {
    type: FETCH_LEADERBOARDS_FAILURE,
    error
  };
}

export default function fetchLeaderboards(query, limit, offset) {
  return dispatch => {
    dispatch(fetchLeaderboardsRequest());

    const url = `${BASE_API_URL}/efficiency/leaderboard`;
    const params = { ...query, limit, offset };
    const refreshResults = !offset;

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchLeaderboardsSuccess(result.data, refreshResults)))
      .catch(error => dispatch(fetchLeaderboardsFailure(error)));
  };
}
