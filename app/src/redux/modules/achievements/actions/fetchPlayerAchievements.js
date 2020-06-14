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

function fetchAchievementsSuccess(playerId, data) {
  return {
    type: FETCH_PLAYER_ACHIEVEMENTS_SUCCESS,
    playerId,
    achievements: data
  };
}

function fetchAchievementsFailure(error) {
  return {
    type: FETCH_PLAYER_ACHIEVEMENTS_FAILURE,
    error
  };
}

export default function fetchAchievements({ playerId }) {
  return dispatch => {
    dispatch(fetchAchievementsRequest());

    const url = `${BASE_API_URL}/players/${playerId}/achievements`;
    const params = { includeMissing: true };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchAchievementsSuccess(playerId, result.data)))
      .catch(error => dispatch(fetchAchievementsFailure(error)));
  };
}
