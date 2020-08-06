import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_NAME_CHANGES_REQUEST,
  FETCH_NAME_CHANGES_SUCCESS,
  FETCH_NAME_CHANGES_FAILURE
} from '../reducer';

function fetchNameChangesRequest() {
  return {
    type: FETCH_NAME_CHANGES_REQUEST
  };
}

function fetchNameChangesSuccess(data, refresh) {
  return {
    type: FETCH_NAME_CHANGES_SUCCESS,
    nameChanges: data,
    refresh
  };
}

function fetchNameChangesFailure(error) {
  return {
    type: FETCH_NAME_CHANGES_FAILURE,
    error
  };
}

export default function fetchNameChanges(limit, offset) {
  return dispatch => {
    dispatch(fetchNameChangesRequest());

    const url = `${BASE_API_URL}/names/`;
    const params = { limit, offset };
    const refreshResults = !offset;

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchNameChangesSuccess(result.data, refreshResults)))
      .catch(error => dispatch(fetchNameChangesFailure(error)));
  };
}
