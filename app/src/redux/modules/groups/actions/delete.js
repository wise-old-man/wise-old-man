import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import { DELETE_GROUP_REQUEST, DELETE_GROUP_SUCCESS, DELETE_GROUP_FAILURE } from '../reducer';

function deleteGroupRequest() {
  return {
    type: DELETE_GROUP_REQUEST
  };
}

function deleteGroupSuccess(id, data) {
  Analytics.event({
    category: 'Group',
    action: 'Deleted group',
    value: id
  });

  return {
    type: DELETE_GROUP_SUCCESS,
    groupId: id,
    message: data.message
  };
}

function deleteGroupFailure(error) {
  return {
    type: DELETE_GROUP_FAILURE,
    error: error.response.data.message
  };
}

export default function deleteGroup(id, verificationCode) {
  return dispatch => {
    dispatch(deleteGroupRequest());

    const url = `${BASE_API_URL}/groups/${id}`;

    return axios
      .delete(url, { data: { verificationCode } })
      .then(result => dispatch(deleteGroupSuccess(id, result.data)))
      .catch(error => dispatch(deleteGroupFailure(error)));
  };
}
