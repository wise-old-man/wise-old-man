import axios from 'axios';
import Analytics from 'react-ga';
import { BASE_API_URL } from '../../../../config';
import { ASSERT_NAME_REQUEST, ASSERT_NAME_SUCCESS, ASSERT_NAME_FAILURE } from '../reducer';

function assertNameRequest() {
  return {
    type: ASSERT_NAME_REQUEST
  };
}

function assertNameSuccess(data, username, playerId) {
  Analytics.event({
    category: 'Player',
    action: 'Asserted player name',
    value: username
  });

  return {
    type: ASSERT_NAME_SUCCESS,
    playerId,
    displayName: data.displayName
  };
}

function assertNameFailure(error) {
  return {
    type: ASSERT_NAME_FAILURE,
    error: error.response.data.message
  };
}

export default function assertName(username, playerId) {
  return dispatch => {
    dispatch(assertNameRequest(username));

    const url = `${BASE_API_URL}/players/assert-name/`;
    const body = { username };

    return axios
      .post(url, body)
      .then(result => dispatch(assertNameSuccess(result.data, username, playerId)))
      .catch(error => dispatch(assertNameFailure(error, username)));
  };
}
