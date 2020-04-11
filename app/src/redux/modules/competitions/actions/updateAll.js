import axios from 'axios';
import { BASE_API_URL } from '../../../../config';
import {
  UPDATE_PARTICIPANTS_REQUEST,
  UPDATE_PARTICIPANTS_SUCCESS,
  UPDATE_PARTICIPANTS_FAILURE
} from '../reducer';

function updateParticipantsRequest() {
  return {
    type: UPDATE_PARTICIPANTS_REQUEST
  };
}

function updateParticipantsSuccess(data) {
  return {
    type: UPDATE_PARTICIPANTS_SUCCESS,
    message: data.message
  };
}

function updateParticipantsFailure(error) {
  return {
    type: UPDATE_PARTICIPANTS_FAILURE,
    error: error.response.data.message
  };
}

export default function updateParticipants(competitionId) {
  return dispatch => {
    dispatch(updateParticipantsRequest());

    const url = `${BASE_API_URL}/competitions/${competitionId}/update-all`;

    return axios
      .post(url)
      .then(result => dispatch(updateParticipantsSuccess(result.data)))
      .catch(error => dispatch(updateParticipantsFailure(error)));
  };
}
