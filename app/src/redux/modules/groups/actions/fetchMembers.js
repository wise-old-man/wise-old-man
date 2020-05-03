import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_GROUP_MEMBERS_REQUEST,
  FETCH_GROUP_MEMBERS_SUCCESS,
  FETCH_GROUP_MEMBERS_FAILURE
} from '../reducer';

function fetchGroupMembersRequest() {
  return {
    type: FETCH_GROUP_MEMBERS_REQUEST
  };
}

function fetchGroupMembersSuccess(groupId, data) {
  return {
    type: FETCH_GROUP_MEMBERS_SUCCESS,
    groupId,
    members: data
  };
}

function fetchGroupMembersFailure(error) {
  return {
    type: FETCH_GROUP_MEMBERS_FAILURE,
    error
  };
}

export default function fetchGroupMembers(id) {
  return dispatch => {
    dispatch(fetchGroupMembersRequest());

    const url = `${BASE_API_URL}/groups/${id}/members`;

    return axios
      .get(url)
      .then(result => dispatch(fetchGroupMembersSuccess(id, result.data)))
      .catch(error => dispatch(fetchGroupMembersFailure(error)));
  };
}
