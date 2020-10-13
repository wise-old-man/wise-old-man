import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_PLAYER_GROUPS_REQUEST,
  FETCH_PLAYER_GROUPS_SUCCESS,
  FETCH_PLAYER_GROUPS_FAILURE
} from '../reducer';

function fetchGroupsRequest() {
  return {
    type: FETCH_PLAYER_GROUPS_REQUEST
  };
}

function fetchGroupsSuccess(data, username) {
  return {
    type: FETCH_PLAYER_GROUPS_SUCCESS,
    groups: data,
    username
  };
}

function fetchGroupsFailure(error) {
  return {
    type: FETCH_PLAYER_GROUPS_FAILURE,
    error
  };
}

export default function fetchGroups({ username }) {
  return dispatch => {
    dispatch(fetchGroupsRequest());

    const url = `${BASE_API_URL}/players/username/${username}/groups/`;

    return axios
      .get(url)
      .then(result => dispatch(fetchGroupsSuccess(result.data, username)))
      .catch(error => dispatch(fetchGroupsFailure(error)));
  };
}
