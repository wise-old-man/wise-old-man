import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_GROUP_ACHIEVEMENTS_REQUEST,
  FETCH_GROUP_ACHIEVEMENTS_SUCCESS,
  FETCH_GROUP_ACHIEVEMENTS_FAILURE
} from '../reducer';

function fetchAchievementsRequest() {
  return {
    type: FETCH_GROUP_ACHIEVEMENTS_REQUEST
  };
}

function fetchAchievementsSuccess(groupId, data) {
  return {
    type: FETCH_GROUP_ACHIEVEMENTS_SUCCESS,
    groupId,
    achievements: data
  };
}

function fetchAchievementsFailure(error) {
  return {
    type: FETCH_GROUP_ACHIEVEMENTS_FAILURE,
    error
  };
}

export default function fetchAchievements(groupId) {
  return dispatch => {
    dispatch(fetchAchievementsRequest());

    const url = `${BASE_API_URL}/groups/${groupId}/achievements`;

    return axios
      .get(url)
      .then(result => dispatch(fetchAchievementsSuccess(groupId, result.data)))
      .catch(error => dispatch(fetchAchievementsFailure(error)));
  };
}
