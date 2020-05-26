import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import { CREATE_GROUP_REQUEST, CREATE_GROUP_SUCCESS, CREATE_GROUP_FAILURE } from '../reducer';

function createGroupRequest() {
  return {
    type: CREATE_GROUP_REQUEST
  };
}

function createGroupSuccess(data) {
  Analytics.event({
    category: 'Group',
    action: 'Created new group',
    value: data.id
  });

  return {
    type: CREATE_GROUP_SUCCESS,
    group: data
  };
}

function createGroupFailure(error) {
  return {
    type: CREATE_GROUP_FAILURE,
    error: error.response.data.message,
    data: error.response.data.data
  };
}

export default function createGroup({ name, clanChat, members }) {
  return dispatch => {
    dispatch(createGroupRequest());

    const url = `${BASE_API_URL}/groups/`;

    const body = { name, clanChat, members };

    return axios
      .post(url, body)
      .then(result => dispatch(createGroupSuccess(result.data)))
      .catch(error => dispatch(createGroupFailure(error)));
  };
}
