import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import { UPDATE_MEMBERS_REQUEST, UPDATE_MEMBERS_SUCCESS, UPDATE_MEMBERS_FAILURE } from '../reducer';

function updateMembersRequest() {
  return {
    type: UPDATE_MEMBERS_REQUEST
  };
}

function updateMembersSuccess(groupId, data) {
  Analytics.event({
    category: 'Groups',
    action: 'Updated all members',
    value: groupId
  });

  return {
    type: UPDATE_MEMBERS_SUCCESS,
    message: data.message
  };
}

function updateMemberssFailure(error) {
  return {
    type: UPDATE_MEMBERS_FAILURE,
    error: error.response.data.message
  };
}

export default function updateMembers(groupId) {
  return dispatch => {
    dispatch(updateMembersRequest());

    const url = `${BASE_API_URL}/groups/${groupId}/update-all`;

    return axios
      .post(url)
      .then(result => dispatch(updateMembersSuccess(groupId, result.data)))
      .catch(error => dispatch(updateMemberssFailure(error)));
  };
}
