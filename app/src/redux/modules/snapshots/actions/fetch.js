import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import { FETCH_SNAPSHOTS_REQUEST, FETCH_SNAPSHOTS_SUCCESS, FETCH_SNAPSHOTS_FAILURE } from '../reducer';

function fetchPlayerSnapshotsRequest() {
  return {
    type: FETCH_SNAPSHOTS_REQUEST
  };
}

function fetchPlayerSnapshotsSuccess(username, period, data) {
  return {
    type: FETCH_SNAPSHOTS_SUCCESS,
    username,
    period,
    snapshotData: data
  };
}

function fetchPlayerSnapshotsFailure(error) {
  return {
    type: FETCH_SNAPSHOTS_FAILURE,
    error
  };
}

export default function fetchPlayerSnapshots({ username, period }) {
  return dispatch => {
    dispatch(fetchPlayerSnapshotsRequest());

    const url = `${BASE_API_URL}/players/username/${username}/snapshots/`;
    const params = { period };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchPlayerSnapshotsSuccess(username, period, result.data)))
      .catch(error => dispatch(fetchPlayerSnapshotsFailure(error)));
  };
}
