import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_GROUP_MONTHLY_TOP_REQUEST,
  FETCH_GROUP_MONTHLY_TOP_SUCCESS,
  FETCH_GROUP_MONTHLY_TOP_FAILURE
} from '../reducer';

function fetchMonthlyTopRequest() {
  return {
    type: FETCH_GROUP_MONTHLY_TOP_REQUEST
  };
}

function fetchMonthlyTopSuccess(groupId, data) {
  return {
    type: FETCH_GROUP_MONTHLY_TOP_SUCCESS,
    groupId,
    monthlyTopPlayer: data
  };
}

function fetchMonthlyTopFailure(error) {
  return {
    type: FETCH_GROUP_MONTHLY_TOP_FAILURE,
    error
  };
}

export default function fetchMonthlyTop(id) {
  return dispatch => {
    dispatch(fetchMonthlyTopRequest());

    const url = `${BASE_API_URL}/groups/${id}/monthly-top`;

    return axios
      .get(url)
      .then(result => dispatch(fetchMonthlyTopSuccess(id, result.data)))
      .catch(error => dispatch(fetchMonthlyTopFailure(error)));
  };
}
