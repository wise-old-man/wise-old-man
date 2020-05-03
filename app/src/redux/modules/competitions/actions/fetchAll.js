import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_COMPETITIONS_REQUEST,
  FETCH_COMPETITIONS_SUCCESS,
  FETCH_COMPETITIONS_FAILURE
} from '../reducer';

function fetchCompetitionsRequest() {
  return {
    type: FETCH_COMPETITIONS_REQUEST
  };
}

function fetchCompetitionsSuccess(data, refresh) {
  return {
    type: FETCH_COMPETITIONS_SUCCESS,
    competitions: data,
    refresh
  };
}

function fetchCompetitionsFailure(error) {
  return {
    type: FETCH_COMPETITIONS_FAILURE,
    error
  };
}

export default function fetchCompetitions(query = {}, limit, offset) {
  return dispatch => {
    dispatch(fetchCompetitionsRequest());

    const url = `${BASE_API_URL}/competitions/`;
    const params = { ...query, limit, offset };
    const refreshResults = !offset;

    return axios
      .get(url, { params })
      .then(result => dispatch(fetchCompetitionsSuccess(result.data, refreshResults)))
      .catch(error => dispatch(fetchCompetitionsFailure(error)));
  };
}
