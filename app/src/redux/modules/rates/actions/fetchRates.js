import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import { FETCH_RATES_REQUEST, FETCH_RATES_SUCCESS, FETCH_RATES_FAILURE } from '../reducer';

function fetchRatesRequest() {
  return {
    type: FETCH_RATES_REQUEST
  };
}

function fetchRatesSuccess(metric, data) {
  return {
    type: FETCH_RATES_SUCCESS,
    metric,
    rates: data
  };
}

function fetchRatesFailure(error) {
  return {
    type: FETCH_RATES_FAILURE,
    error
  };
}

export default function fetchRates(metric = 'ehp', type = 'main') {
  return dispatch => {
    dispatch(fetchRatesRequest());

    const url = `${BASE_API_URL}/efficiency/rates`;
    const params = { metric, type };
    return axios
      .get(url, { params })
      .then(result => dispatch(fetchRatesSuccess(metric, result.data)))
      .catch(error => dispatch(fetchRatesFailure(error)));
  };
}
