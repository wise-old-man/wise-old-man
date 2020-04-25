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

function fetchGroupsSuccess(data, playerId) {
  return {
    type: FETCH_PLAYER_GROUPS_SUCCESS,
    groups: data,
    playerId
  };
}

function fetchGroupsFailure(error) {
  return {
    type: FETCH_PLAYER_GROUPS_FAILURE,
    error
  };
}

export default function fetchGroups({ playerId }) {
  return dispatch => {
    dispatch(fetchGroupsRequest());

    const url = `${BASE_API_URL}/groups/`;
    const params = { playerId };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchGroupsSuccess(result.data, playerId)))
      .catch(error => dispatch(fetchGroupsFailure(error)));
  };
}
