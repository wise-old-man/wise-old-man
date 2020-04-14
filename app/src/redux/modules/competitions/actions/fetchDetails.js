import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  FETCH_COMPETITION_REQUEST,
  FETCH_COMPETITION_SUCCESS,
  FETCH_COMPETITION_FAILURE,
} from '../reducer';

function fetchCompetitionRequest() {
  return {
    type: FETCH_COMPETITION_REQUEST,
  };
}

function fetchCompetitionSuccess(data) {
  return {
    type: FETCH_COMPETITION_SUCCESS,
    competition: data,
  };
}

function fetchCompetitionFailure(error) {
  return {
    type: FETCH_COMPETITION_FAILURE,
    error,
  };
}

export default function fetchCompetition(id) {
  return dispatch => {
    dispatch(fetchCompetitionRequest());

    const url = `${BASE_API_URL}/competitions/${id}`;

    return axios
      .get(url)
      .then(result => dispatch(fetchCompetitionSuccess(result.data)))
      .catch(error => dispatch(fetchCompetitionFailure(error)));
  };
}
