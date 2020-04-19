import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import { FETCH_GROUP_REQUEST, FETCH_GROUP_SUCCESS, FETCH_GROUP_FAILURE } from '../reducer';

function fetchGroupRequest() {
  return {
    type: FETCH_GROUP_REQUEST
  };
}

function fetchGroupSuccess(data) {
  return {
    type: FETCH_GROUP_SUCCESS,
    group: data
  };
}

function fetchGroupFailure(error) {
  return {
    type: FETCH_GROUP_FAILURE,
    error
  };
}

export default function fetchGroup(id) {
  return dispatch => {
    dispatch(fetchGroupRequest());

    const url = `${BASE_API_URL}/groups/${id}`;

    return axios
      .get(url)
      .then(result => dispatch(fetchGroupSuccess(result.data)))
      .catch(error => dispatch(fetchGroupFailure(error)));
  };
}
