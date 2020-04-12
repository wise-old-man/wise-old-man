import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import {
  EDIT_COMPETITION_REQUEST,
  EDIT_COMPETITION_SUCCESS,
  EDIT_COMPETITION_FAILURE
} from '../reducer';

function editCompetitionRequest() {
  return {
    type: EDIT_COMPETITION_REQUEST
  };
}

function editCompetitionSuccess(data) {
  Analytics.event({
    category: 'Competition',
    action: 'Edited competition',
    value: data.id
  });

  return {
    type: EDIT_COMPETITION_SUCCESS,
    competition: data
  };
}

function editCompetitionFailure(error) {
  return {
    type: EDIT_COMPETITION_FAILURE,
    error: error.response.data.message
  };
}

export default function editCompetition(id, requestBody) {
  return dispatch => {
    dispatch(editCompetitionRequest());

    const url = `${BASE_API_URL}/competitions/${id}`;

    const body = {
      title: requestBody.title,
      metric: requestBody.metric,
      startsAt: requestBody.startDate,
      endsAt: requestBody.endDate,
      participants: requestBody.participants,
      verificationCode: requestBody.verificationCode
    };

    return axios
      .put(url, body)
      .then(result => dispatch(editCompetitionSuccess(result.data)))
      .catch(error => dispatch(editCompetitionFailure(error)));
  };
}
