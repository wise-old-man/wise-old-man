import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import { FETCH_GROUPS_REQUEST, FETCH_GROUPS_SUCCESS, FETCH_GROUPS_FAILURE } from '../reducer';

function fetchGroupsRequest() {
  return {
    type: FETCH_GROUPS_REQUEST
  };
}

function fetchGroupsSuccess(data, refresh) {
  return {
    type: FETCH_GROUPS_SUCCESS,
    groups: data,
    refresh
  };
}

function fetchGroupsFailure(error) {
  return {
    type: FETCH_GROUPS_FAILURE,
    error
  };
}

export default function fetchGroups(query = {}, limit, offset) {
  return dispatch => {
    dispatch(fetchGroupsRequest());

    const url = `${BASE_API_URL}/groups/`;
    const params = { ...query, limit, offset };
    const refreshResults = !offset;

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchGroupsSuccess(result.data, refreshResults)))
      .catch(error => dispatch(fetchGroupsFailure(error)));
  };
}
