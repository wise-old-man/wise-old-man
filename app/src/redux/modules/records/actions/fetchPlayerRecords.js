import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_PLAYER_RECORDS_REQUEST,
  FETCH_PLAYER_RECORDS_SUCCESS,
  FETCH_PLAYER_RECORDS_FAILURE
} from '../reducer';

function fetchPlayerRecordsRequest() {
  return {
    type: FETCH_PLAYER_RECORDS_REQUEST
  };
}

function fetchPlayerRecordsSuccess(username, data) {
  return {
    type: FETCH_PLAYER_RECORDS_SUCCESS,
    username,
    records: data
  };
}

function fetchPlayerRecordsFailure(error) {
  return {
    type: FETCH_PLAYER_RECORDS_FAILURE,
    error
  };
}

export default function fetchPlayerRecords({ username }) {
  return dispatch => {
    dispatch(fetchPlayerRecordsRequest());

    const url = `${BASE_API_URL}/players/username/${username}/records/`;

    return axios
      .get(url)
      .then(result => dispatch(fetchPlayerRecordsSuccess(username, result.data)))
      .catch(error => dispatch(fetchPlayerRecordsFailure(error)));
  };
}
