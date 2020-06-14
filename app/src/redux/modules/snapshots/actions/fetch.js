import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import { FETCH_SNAPSHOTS_REQUEST, FETCH_SNAPSHOTS_SUCCESS, FETCH_SNAPSHOTS_FAILURE } from '../reducer';

function fetchPlayerSnapshotsRequest() {
  return {
    type: FETCH_SNAPSHOTS_REQUEST
  };
}

function fetchPlayerSnapshotsSuccess(playerId, data) {
  return {
    type: FETCH_SNAPSHOTS_SUCCESS,
    playerId,
    snapshotData: data
  };
}

function fetchPlayerSnapshotsFailure(error) {
  return {
    type: FETCH_SNAPSHOTS_FAILURE,
    error
  };
}

export default function fetchPlayerSnapshots({ playerId, period }) {
  return dispatch => {
    dispatch(fetchPlayerSnapshotsRequest());

    const url = `${BASE_API_URL}/players/${playerId}/snapshots/`;
    const params = { period };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchPlayerSnapshotsSuccess(playerId, result.data)))
      .catch(error => dispatch(fetchPlayerSnapshotsFailure(error)));
  };
}
