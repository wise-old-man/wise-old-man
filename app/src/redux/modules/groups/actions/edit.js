import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import { EDIT_GROUP_REQUEST, EDIT_GROUP_SUCCESS, EDIT_GROUP_FAILURE } from '../reducer';

function editGroupRequest() {
  return {
    type: EDIT_GROUP_REQUEST
  };
}

function editGroupSuccess(data) {
  Analytics.event({
    category: 'Group',
    action: 'Edited group',
    value: data.id
  });

  return {
    type: EDIT_GROUP_SUCCESS,
    group: data
  };
}

function editGroupFailure(error) {
  return {
    type: EDIT_GROUP_FAILURE,
    error: error.response.data.message,
    data: error.response.data.data
  };
}

export default function editGroup(id, requestBody) {
  return dispatch => {
    dispatch(editGroupRequest());

    const url = `${BASE_API_URL}/groups/${id}`;

    const body = {
      name: requestBody.name,
      members: requestBody.members,
      verificationCode: requestBody.verificationCode
    };

    return axios
      .put(url, body)
      .then(result => dispatch(editGroupSuccess(result.data)))
      .catch(error => dispatch(editGroupFailure(error)));
  };
}
