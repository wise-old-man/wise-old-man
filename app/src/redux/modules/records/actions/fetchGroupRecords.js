import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_GROUP_RECORDS_REQUEST,
  FETCH_GROUP_RECORDS_SUCCESS,
  FETCH_GROUP_RECORDS_FAILURE
} from '../reducer';

function fetchGroupRecordsRequest() {
  return {
    type: FETCH_GROUP_RECORDS_REQUEST
  };
}

function fetchGroupRecordsSuccess(groupId, data) {
  return {
    type: FETCH_GROUP_RECORDS_SUCCESS,
    groupId,
    records: data
  };
}

function fetchGroupRecordsFailure(error) {
  return {
    type: FETCH_GROUP_RECORDS_FAILURE,
    error
  };
}

export default function fetchGroupRecords(groupId, metric, period) {
  return dispatch => {
    dispatch(fetchGroupRecordsRequest());

    const url = `${BASE_API_URL}/groups/${groupId}/records`;
    const params = { metric, period };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchGroupRecordsSuccess(groupId, result.data)))
      .catch(error => dispatch(fetchGroupRecordsFailure(error)));
  };
}
