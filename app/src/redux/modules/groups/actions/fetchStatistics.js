import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_GROUP_STATISTICS_REQUEST,
  FETCH_GROUP_STATISTICS_SUCCESS,
  FETCH_GROUP_STATISTICS_FAILURE
} from '../reducer';

function fetchStatisticsRequest() {
  return {
    type: FETCH_GROUP_STATISTICS_REQUEST
  };
}

function fetchStatisticsSuccess(groupId, data) {
  return {
    type: FETCH_GROUP_STATISTICS_SUCCESS,
    groupId,
    statistics: data
  };
}

function fetchStatisticsFailure(error) {
  return {
    type: FETCH_GROUP_STATISTICS_FAILURE,
    error
  };
}

export default function fetchStatistics(id) {
  return dispatch => {
    dispatch(fetchStatisticsRequest());

    const url = `${BASE_API_URL}/groups/${id}/statistics`;

    return axios
      .get(url)
      .then(result => dispatch(fetchStatisticsSuccess(id, result.data)))
      .catch(error => dispatch(fetchStatisticsFailure(error)));
  };
}
