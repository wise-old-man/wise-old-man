import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import {
  CREATE_COMPETITION_REQUEST,
  CREATE_COMPETITION_SUCCESS,
  CREATE_COMPETITION_FAILURE,
} from '../reducer';

function createCompetitionRequest() {
  return {
    type: CREATE_COMPETITION_REQUEST,
  };
}

function createCompetitionSuccess(data) {
  Analytics.event({
    category: 'Competition',
    action: 'Created new competition',
    value: data.id,
  });

  return {
    type: CREATE_COMPETITION_SUCCESS,
    competition: data,
  };
}

function createCompetitionFailure(error) {
  return {
    type: CREATE_COMPETITION_FAILURE,
    error: error.response.data.message,
  };
}

export default function createCompetition({
  title, metric, startDate, endDate, participants,
}) {
  return dispatch => {
    dispatch(createCompetitionRequest());

    const url = `${BASE_API_URL}/competitions/`;

    const body = {
      title,
      metric,
      startsAt: startDate,
      endsAt: endDate,
      participants,
    };

    return axios
      .post(url, body)
      .then(result => dispatch(createCompetitionSuccess(result.data)))
      .catch(error => dispatch(createCompetitionFailure(error)));
  };
}
