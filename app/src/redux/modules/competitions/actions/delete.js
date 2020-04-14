import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import {
  DELETE_COMPETITION_REQUEST,
  DELETE_COMPETITION_SUCCESS,
  DELETE_COMPETITION_FAILURE,
} from '../reducer';

function deleteCompetitionRequest() {
  return {
    type: DELETE_COMPETITION_REQUEST,
  };
}

function deleteCompetitionSuccess(id, data) {
  Analytics.event({
    category: 'Competition',
    action: 'Deleted competition',
    value: id,
  });

  return {
    type: DELETE_COMPETITION_SUCCESS,
    competitionId: id,
    message: data.message,
  };
}

function deleteCompetitionFailure(error) {
  return {
    type: DELETE_COMPETITION_FAILURE,
    error: error.response.data.message,
  };
}

export default function deleteCompetition(id, verificationCode) {
  return dispatch => {
    dispatch(deleteCompetitionRequest());

    const url = `${BASE_API_URL}/competitions/${id}`;

    return axios
      .delete(url, { data: { verificationCode } })
      .then(result => dispatch(deleteCompetitionSuccess(id, result.data)))
      .catch(error => dispatch(deleteCompetitionFailure(error)));
  };
}
