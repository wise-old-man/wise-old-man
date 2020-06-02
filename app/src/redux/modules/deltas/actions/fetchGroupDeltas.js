import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_GROUP_DELTAS_REQUEST,
  FETCH_GROUP_DELTAS_SUCCESS,
  FETCH_GROUP_DELTAS_FAILURE
} from '../reducer';

function fetchGroupDeltasRequest() {
  return {
    type: FETCH_GROUP_DELTAS_REQUEST
  };
}

function fetchGroupDeltasSuccess(groupId, data) {
  return {
    type: FETCH_GROUP_DELTAS_SUCCESS,
    groupId,
    deltas: data
  };
}

function fetchGroupDeltasFailure(error) {
  return {
    type: FETCH_GROUP_DELTAS_FAILURE,
    error
  };
}

export default function fetchGroupDeltas(groupId, metric, period) {
  return dispatch => {
    dispatch(fetchGroupDeltasRequest());

    const url = `${BASE_API_URL}/groups/${groupId}/leaderboard`;
    const params = { metric, period };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchGroupDeltasSuccess(groupId, result.data)))
      .catch(error => dispatch(fetchGroupDeltasFailure(error)));
  };
}
