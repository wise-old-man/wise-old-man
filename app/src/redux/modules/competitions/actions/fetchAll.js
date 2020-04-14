import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_COMPETITIONS_REQUEST,
  FETCH_COMPETITIONS_SUCCESS,
  FETCH_COMPETITIONS_FAILURE,
} from '../reducer';

function fetchCompetitionsRequest() {
  return {
    type: FETCH_COMPETITIONS_REQUEST,
  };
}

function fetchCompetitionsSuccess(data) {
  return {
    type: FETCH_COMPETITIONS_SUCCESS,
    competitions: data,
  };
}

function fetchCompetitionsFailure(error) {
  return {
    type: FETCH_COMPETITIONS_FAILURE,
    error,
  };
}

export default function fetchCompetitions(query = {}) {
  return dispatch => {
    dispatch(fetchCompetitionsRequest());

    const url = `${BASE_API_URL}/competitions/`;
    const params = query;

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchCompetitionsSuccess(result.data)))
      .catch(error => dispatch(fetchCompetitionsFailure(error)));
  };
}
