import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_PLAYER_ACHIEVEMENTS_REQUEST,
  FETCH_PLAYER_ACHIEVEMENTS_SUCCESS,
  FETCH_PLAYER_ACHIEVEMENTS_FAILURE
} from '../reducer';

function fetchAchievementsRequest() {
  return {
    type: FETCH_PLAYER_ACHIEVEMENTS_REQUEST
  };
}

function fetchAchievementsSuccess(username, data) {
  return {
    type: FETCH_PLAYER_ACHIEVEMENTS_SUCCESS,
    username,
    achievements: data
  };
}

function fetchAchievementsFailure(error) {
  return {
    type: FETCH_PLAYER_ACHIEVEMENTS_FAILURE,
    error
  };
}

export default function fetchAchievements({ username }) {
  return dispatch => {
    dispatch(fetchAchievementsRequest());

    const url = `${BASE_API_URL}/players/username/${username}/achievements`;
    const params = { includeMissing: true };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchAchievementsSuccess(username, result.data)))
      .catch(error => dispatch(fetchAchievementsFailure(error)));
  };
}
