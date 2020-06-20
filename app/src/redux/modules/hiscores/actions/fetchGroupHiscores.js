import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_GROUP_HISCORES_REQUEST,
  FETCH_GROUP_HISCORES_SUCCESS,
  FETCH_GROUP_HISCORES_FAILURE
} from '../reducer';

function fetchHiscoresRequest() {
  return {
    type: FETCH_GROUP_HISCORES_REQUEST
  };
}

function fetchHiscoresSuccess(groupId, data) {
  return {
    type: FETCH_GROUP_HISCORES_SUCCESS,
    groupId,
    hiscores: data
  };
}

function fetchHiscoresFailure(error) {
  return {
    type: FETCH_GROUP_HISCORES_FAILURE,
    error
  };
}

export default function fetchHiscores(groupId, metric) {
  return dispatch => {
    dispatch(fetchHiscoresRequest());

    const url = `${BASE_API_URL}/groups/${groupId}/hiscores`;
    const params = { metric };

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchHiscoresSuccess(groupId, result.data)))
      .catch(error => dispatch(fetchHiscoresFailure(error)));
  };
}
