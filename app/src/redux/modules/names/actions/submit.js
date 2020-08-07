import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import {
  SUBMIT_NAME_CHANGE_REQUEST,
  SUBMIT_NAME_CHANGE_FAILURE,
  SUBMIT_NAME_CHANGE_SUCCESS
} from '../reducer';

function submitNameChangeRequest() {
  return { type: SUBMIT_NAME_CHANGE_REQUEST };
}

function submitNameChangeSuccess(data) {
  Analytics.event({
    category: 'Name change',
    action: 'Submitted new name change',
    value: data.id
  });

  return {
    type: SUBMIT_NAME_CHANGE_SUCCESS,
    nameChange: data
  };
}

function submitNameChangeFailure(error) {
  return {
    type: SUBMIT_NAME_CHANGE_FAILURE,
    error: error.response.data.message
  };
}

export default function submitNameChange({ oldName, newName }) {
  return dispatch => {
    dispatch(submitNameChangeRequest());

    const url = `${BASE_API_URL}/names/`;
    const body = { oldName, newName };

    return axios
      .post(url, body)
      .then(result => dispatch(submitNameChangeSuccess(result.data)))
      .catch(error => dispatch(submitNameChangeFailure(error)));
  };
}
